const Resource = require('../models/Resource');
const { callAI } = require('./aiService');
const logger = require('../utils/logger');

/**
 * Analyze roadmap content and extract key learning topics
 */
async function analyzeRoadmapContent(roadmapData) {
    const systemPrompt = `You are an expert educational content analyzer. Extract key learning topics and concepts from the provided roadmap data.

Return ONLY a JSON object with this structure:
{
  "topics": ["topic1", "topic2", "topic3"],
  "skills": ["skill1", "skill2", "skill3"],
  "technologies": ["tech1", "tech2", "tech3"],
  "difficultyLevel": "beginner|intermediate|advanced",
  "learningAreas": ["area1", "area2", "area3"]
}

Focus on extracting actionable learning topics that would benefit from structured courses.`;

    const userPrompt = `Analyze this roadmap and extract key learning topics:

Title: ${roadmapData.title}
Description: ${roadmapData.description}
Difficulty: ${roadmapData.difficulty}
Steps: ${JSON.stringify(roadmapData.steps.map(step => ({
    title: step.title,
    description: step.description,
    skills: step.skills
})))}
Skills Required: ${JSON.stringify(roadmapData.skillsRequired || [])}
Skills Learned: ${JSON.stringify(roadmapData.skillsLearned || [])}
Tags: ${JSON.stringify(roadmapData.tags || [])}`;

    try {
        const result = await callAI(userPrompt, systemPrompt, {
            responseMimeType: 'application/json'
        });
        
        const analysis = JSON.parse(result.content);
        logger.log('INFO', 'Roadmap content analysis completed', { 
            topics: analysis.topics?.length || 0,
            skills: analysis.skills?.length || 0 
        });
        
        return analysis;
    } catch (error) {
        logger.log('ERROR', 'Error analyzing roadmap content:', { error: error.message });
        // Fallback to basic keyword extraction
        return extractBasicTopics(roadmapData);
    }
}

/**
 * Basic topic extraction fallback
 */
function extractBasicTopics(roadmapData) {
    const text = `${roadmapData.title} ${roadmapData.description} ${roadmapData.steps.map(s => s.title).join(' ')}`;
    const words = text.toLowerCase().split(/\s+/);
    const commonTechTerms = [
        'javascript', 'python', 'react', 'node', 'html', 'css', 'sql', 'mongodb',
        'machine learning', 'data science', 'web development', 'mobile development',
        'ui', 'ux', 'design', 'programming', 'algorithms', 'database', 'api',
        'frontend', 'backend', 'fullstack', 'devops', 'cloud', 'security'
    ];
    
    const topics = commonTechTerms.filter(term => 
        text.toLowerCase().includes(term.toLowerCase())
    );
    
    return {
        topics: topics.slice(0, 5),
        skills: roadmapData.skillsLearned || [],
        technologies: topics,
        difficultyLevel: roadmapData.difficulty,
        learningAreas: topics
    };
}

/**
 * Calculate relevance score between course and roadmap topics
 */
function calculateRelevanceScore(course, topics, skills, technologies) {
    let score = 0;
    const maxScore = 100;
    
    // Title matching (40 points)
    const titleWords = course.title.toLowerCase().split(/\s+/);
    const titleMatches = topics.filter(topic => 
        titleWords.some(word => topic.toLowerCase().includes(word) || word.includes(topic.toLowerCase()))
    ).length;
    score += (titleMatches / topics.length) * 40;
    
    // Description matching (25 points)
    const descriptionWords = course.description.toLowerCase().split(/\s+/);
    const descMatches = topics.filter(topic => 
        descriptionWords.some(word => topic.toLowerCase().includes(word) || word.includes(topic.toLowerCase()))
    ).length;
    score += (descMatches / topics.length) * 25;
    
    // Skills learned matching (20 points)
    const skillsLearned = course.skillsLearned || [];
    const skillMatches = skills.filter(skill => 
        skillsLearned.some(learned => 
            skill.toLowerCase().includes(learned.toLowerCase()) || 
            learned.toLowerCase().includes(skill.toLowerCase())
        )
    ).length;
    score += (skillMatches / skills.length) * 20;
    
    // Tags matching (15 points)
    const courseTags = course.tags || [];
    const tagMatches = topics.filter(topic => 
        courseTags.some(tag => 
            topic.toLowerCase().includes(tag.toLowerCase()) || 
            tag.toLowerCase().includes(topic.toLowerCase())
        )
    ).length;
    score += (tagMatches / topics.length) * 15;
    
    return Math.min(Math.round(score), maxScore);
}

/**
 * Get course suggestions based on roadmap analysis
 */
async function getCourseSuggestions(roadmapData, options = {}) {
    try {
        // Analyze roadmap content
        const analysis = await analyzeRoadmapContent(roadmapData);
        const { topics, skills, technologies, difficultyLevel } = analysis;
        
        logger.log('INFO', 'Analyzing roadmap for course suggestions', {
            roadmapTitle: roadmapData.title,
            topics: topics.length,
            skills: skills.length,
            technologies: technologies.length
        });
        
        // Build query for course matching
        const query = {
            type: 'course',
            isActive: true
        };
        
        // Filter by difficulty if specified
        if (options.difficultyFilter && options.difficultyFilter !== 'all') {
            query.difficulty = options.difficultyFilter;
        } else if (difficultyLevel) {
            // Default to roadmap difficulty level
            query.difficulty = difficultyLevel;
        }
        
        // Search for courses with matching tags or skills
        const orConditions = [];
        
        if (topics.length > 0) {
            orConditions.push({ tags: { $in: topics } });
        }
        
        if (skills.length > 0) {
            orConditions.push({ skillsLearned: { $in: skills } });
        }
        
        if (technologies.length > 0) {
            orConditions.push({ tags: { $in: technologies } });
        }
        
        if (orConditions.length > 0) {
            query.$or = orConditions;
        }
        
        // Fetch potential courses
        const potentialCourses = await Resource.find(query)
            .limit(20) // Get more courses for better scoring
            .lean();
        
        logger.log('INFO', `Found ${potentialCourses.length} potential courses`);
        
        // Calculate relevance scores
        const scoredCourses = potentialCourses.map(course => ({
            ...course,
            relevanceScore: calculateRelevanceScore(course, topics, skills, technologies),
            matchedTopics: topics.filter(topic => 
                course.title.toLowerCase().includes(topic.toLowerCase()) ||
                course.description.toLowerCase().includes(topic.toLowerCase()) ||
                (course.tags || []).some(tag => tag.toLowerCase().includes(topic.toLowerCase()))
            )
        }));
        
        // Sort by relevance score and filter by minimum score
        const minScore = options.minScore || 30;
        const filteredCourses = scoredCourses
            .filter(course => course.relevanceScore >= minScore)
            .sort((a, b) => b.relevanceScore - a.relevanceScore);
        
        // Get top suggestions (default 5, max 10)
        const maxSuggestions = Math.min(options.maxSuggestions || 5, 10);
        const suggestions = filteredCourses.slice(0, maxSuggestions);
        
        logger.log('INFO', `Returning ${suggestions.length} course suggestions`, {
            averageScore: suggestions.reduce((sum, c) => sum + c.relevanceScore, 0) / suggestions.length || 0
        });

        // Handle case when no courses are found
        if (suggestions.length === 0) {
            logger.log('INFO', 'No courses found matching criteria', {
                topics: topics.length,
                skills: skills.length,
                technologies: technologies.length,
                minScore,
                potentialCourses: potentialCourses.length
            });

            // Try to get popular fallback courses
            const fallbackCourses = await getPopularCourses(difficultyLevel, 3);
            
            return {
                success: true,
                suggestions: fallbackCourses.map(course => ({
                    _id: course._id,
                    title: course.title,
                    description: course.description,
                    url: course.url,
                    difficulty: course.difficulty,
                    estimatedTime: course.estimatedTime,
                    tags: course.tags,
                    skillsLearned: course.skillsLearned,
                    rating: course.rating,
                    relevanceScore: course.relevanceScore,
                    matchedTopics: course.matchedTopics,
                    isPopularFallback: true
                })),
                analysis: {
                    topics,
                    skills,
                    technologies,
                    difficultyLevel
                },
                totalFound: 0,
                queryUsed: query,
                message: 'No courses found matching your specific roadmap content. Showing popular courses instead.',
                actionableFeedback: {
                    type: 'no_courses_found',
                    message: 'We couldn\'t find courses that exactly match your roadmap content.',
                    suggestions: [
                        'Try adjusting your roadmap title or description to include more common keywords',
                        'Check if your roadmap uses standard industry terminology',
                        'Consider broadening your learning objectives',
                        'Contact support if you believe courses should be available for your topic'
                    ],
                    supportContact: 'support@nexstepai.com'
                }
            };
        }
        
        return {
            success: true,
            suggestions: suggestions.map(course => ({
                _id: course._id,
                title: course.title,
                description: course.description,
                url: course.url,
                difficulty: course.difficulty,
                estimatedTime: course.estimatedTime,
                tags: course.tags,
                skillsLearned: course.skillsLearned,
                rating: course.rating,
                relevanceScore: course.relevanceScore,
                matchedTopics: course.matchedTopics
            })),
            analysis: {
                topics,
                skills,
                technologies,
                difficultyLevel
            },
            totalFound: filteredCourses.length,
            queryUsed: query
        };
        
    } catch (error) {
        logger.log('ERROR', 'Error generating course suggestions:', { error: error.message });
        return {
            success: false,
            error: error.message,
            suggestions: [],
            fallback: true
        };
    }
}

/**
 * Record user feedback on course suggestions
 */
async function recordCourseFeedback(userId, courseId, roadmapId, feedback) {
    try {
        // This would typically save to a feedback collection
        // For now, we'll just log it
        logger.log('INFO', 'Course feedback recorded', {
            userId,
            courseId,
            roadmapId,
            feedback: feedback.type, // 'accepted', 'rejected', 'saved'
            timestamp: new Date()
        });
        
        return { success: true };
    } catch (error) {
        logger.log('ERROR', 'Error recording course feedback:', { error: error.message });
        return { success: false, error: error.message };
    }
}

/**
 * Get popular courses for fallback suggestions
 */
async function getPopularCourses(difficulty, limit = 5) {
    try {
        const courses = await Resource.find({
            type: 'course',
            isActive: true,
            difficulty: difficulty || 'beginner'
        })
        .sort({ rating: -1, createdAt: -1 })
        .limit(limit)
        .lean();
        
        return courses.map(course => ({
            ...course,
            relevanceScore: 50, // Default score for popular courses
            matchedTopics: [],
            isPopularFallback: true
        }));
    } catch (error) {
        logger.log('ERROR', 'Error fetching popular courses:', { error: error.message });
        return [];
    }
}

module.exports = {
    getCourseSuggestions,
    analyzeRoadmapContent,
    recordCourseFeedback,
    getPopularCourses,
    calculateRelevanceScore
};