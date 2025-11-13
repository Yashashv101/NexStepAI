const { GoogleGenerativeAI } = require('@google/generative-ai');
const { aiConfig, getServicePriority } = require('../config/aiConfig');
const { getCourseSuggestions } = require('./courseSuggestionService');
const { getCourseRecommendations } = require('./courseRecommender');

// Initialize AI clients
let geminiClient = null;

if (aiConfig.gemini.enabled) {
    geminiClient = new GoogleGenerativeAI(aiConfig.gemini.apiKey);
}

/**
 * Call Google Gemini API
 */
async function callGemini(prompt, systemPrompt = '', options = {}) {
    if (!geminiClient) {
        throw new Error('Gemini is not configured');
    }

    try {
        const generationConfig = {
            temperature: aiConfig.gemini.temperature,
            maxOutputTokens: aiConfig.gemini.maxTokens,
        };

        // Allow forcing JSON responses and schemas via options
        if (options.responseMimeType) {
            generationConfig.responseMimeType = options.responseMimeType;
        }
        if (options.responseSchema) {
            generationConfig.responseSchema = options.responseSchema;
        }

        const model = geminiClient.getGenerativeModel({
            model: aiConfig.gemini.model,
            generationConfig,
        });

        // Combine system prompt and user prompt for Gemini
        const fullPrompt = systemPrompt
            ? `${systemPrompt}\n\n${prompt}`
            : prompt;

        // Use the correct Gemini API call structure
        const result = await model.generateContent(fullPrompt);

        const response = await result.response;
        
        // Check if the response was blocked or filtered
        if (response.promptFeedback && response.promptFeedback.blockReason) {
            throw new Error(`Content blocked: ${response.promptFeedback.blockReason}`);
        }

        const content = response.text();

        // Validate response content
        if (!content || content.trim().length === 0) {
            throw new Error('Empty response from Gemini API');
        }

        // Check for potential truncation indicators
        if (content.length < 50) {
            console.warn('Warning: Very short response from Gemini API');
        }

        return {
            success: true,
            content,
            service: 'gemini',
            model: aiConfig.gemini.model,
            usage: response.usageMetadata || {},
        };
    } catch (error) {
        console.error('Gemini API Error:', error.message);
        throw new Error(`Gemini API failed: ${error.message}`);
    }
}

/**
 * Call AI with Gemini
 */
async function callAI(prompt, systemPrompt = '', options = {}) {
    const servicePriority = getServicePriority();
    const errors = [];

    for (const service of servicePriority) {
        try {
            console.log(`Attempting to call ${service.toUpperCase()} AI service...`);

            let result;
            if (service === 'gemini' && aiConfig.gemini.enabled) {
                result = await callGemini(prompt, systemPrompt, options);
            } else {
                continue;
            }

            console.log(`${service.toUpperCase()} AI call successful`);
            return result;
        } catch (error) {
            console.error(`${service.toUpperCase()} failed:`, error.message);
            errors.push({
                service,
                error: error.message,
            });
        }
    }

    // All services failed
    throw new Error(
        `AI service failed. Errors: ${errors
            .map((e) => `${e.service}: ${e.error}`)
            .join(', ')}`
    );
}

/**
 * Generate a structured roadmap using AI
 */
async function generateRoadmap(goalData, userContext = {}) {
    const systemPrompt = `You are an expert curriculum designer.

Return ONLY JSON. Prioritize complete step-by-step content over headings/descriptions. If token-limited, include all steps first and keep metadata concise. Do not include markdown or extra text.`;

    const userPrompt = `Create a comprehensive learning roadmap for the following goal:

Goal Name: ${goalData.name}
Description: ${goalData.description}
Category: ${goalData.category}
Difficulty Level: ${goalData.difficulty}
${goalData.estimatedTime ? `Estimated Time: ${goalData.estimatedTime}` : ''}
${userContext.skillLevel ? `User's Current Skill Level: ${userContext.skillLevel}` : ''}
${userContext.background ? `User's Background: ${userContext.background}` : ''}
${userContext.timeAvailability ? `Time Availability: ${userContext.timeAvailability}` : ''}

Return a JSON object with this exact structure (ensure steps are complete):
{
  "title": "string (engaging title for the roadmap)",
  "description": "string (brief overview of what the user will learn)",
  "estimatedDuration": "string (e.g., '3-6 months', '12-16 weeks')",
  "difficulty": "string (beginner/intermediate/advanced)",
  "steps": [
    {
      "title": "string (step title)",
      "description": "string (detailed description of what to learn/do)",
      "duration": "string (e.g., '2 weeks', '1 month')",
      "skills": ["string (skill 1)", "string (skill 2)", "string (skill 3)"],
      "order": number (starting from 1)
    }
  ],
  "skillsRequired": ["string (prerequisite skill 1)", "string (prerequisite skill 2)"],
  "skillsLearned": ["string (skill 1)", "string (skill 2)", "string (skill 3)"],
  "tags": ["string (tag 1)", "string (tag 2)", "string (tag 3)"]
}

Requirements:
- Include at least 6 detailed steps that progressively build skills
- Each step should have 3-5 specific skills to learn
- Be specific and actionable with realistic time estimates
- If token-limited, prioritize returning the full steps array
- Return ONLY the JSON object, no additional text or formatting`;

    try {
        let response;
        let retryCount = 0;
        const maxRetries = 2;

        // Define response schemas to help Gemini format output
        const stepSchema = {
            type: 'object',
            properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                duration: { type: 'string' },
                skills: { type: 'array', items: { type: 'string' } },
                order: { type: 'integer' }
            },
            required: ['title', 'description', 'duration', 'skills', 'order']
        };

        const fullSchema = {
            type: 'object',
            properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                estimatedDuration: { type: 'string' },
                difficulty: { type: 'string' },
                steps: { type: 'array', minItems: 6, items: stepSchema },
                skillsRequired: { type: 'array', items: { type: 'string' } },
                skillsLearned: { type: 'array', items: { type: 'string' } },
                tags: { type: 'array', items: { type: 'string' } }
            },
            required: ['title', 'description', 'estimatedDuration', 'difficulty', 'steps']
        };

        const stepsOnlySchema = {
            type: 'object',
            properties: {
                steps: { type: 'array', minItems: 6, items: stepSchema }
            },
            required: ['steps']
        };

        while (retryCount < maxRetries) {
            try {
                response = await callAI(userPrompt, systemPrompt, { responseMimeType: 'application/json', responseSchema: fullSchema });
                
                // Parse the JSON response
                let parsedRoadmap;
                try {
                    // Clean up the response - remove markdown code blocks if present
                    let content = response.content.trim();

                    // Remove markdown code blocks
                    content = content.replace(/```json\s*/g, '');
                    content = content.replace(/```\s*/g, '');

                    // Handle incomplete JSON responses by attempting to extract valid JSON
                    // Look for the start of a JSON object
                    const jsonStart = content.indexOf('{');
                    if (jsonStart !== -1) {
                        content = content.substring(jsonStart);
                    }

                    // Try to find a complete JSON object by looking for matching braces
                    let braceCount = 0;
                    let jsonEnd = -1;
                    
                    for (let i = 0; i < content.length; i++) {
                        if (content[i] === '{') braceCount++;
                        if (content[i] === '}') braceCount--;
                        
                        if (braceCount === 0 && i > 0) {
                            jsonEnd = i + 1;
                            break;
                        }
                    }

                    // If we found a complete JSON object, use it
                    if (jsonEnd !== -1) {
                        content = content.substring(0, jsonEnd);
                    }

                    // Parse JSON
                    parsedRoadmap = JSON.parse(content);
                } catch (parseError) {
                    console.log('Attempting to reconstruct valid JSON from incomplete response...');
                    
                    try {
                        // Extract basic fields that should be present
                        const titleMatch = response.content.match(/"title":\s*"([^"]*)"/);
                        const descriptionMatch = response.content.match(/"description":\s*"([^"]*)"/);
                        const durationMatch = response.content.match(/"estimatedDuration":\s*"([^"]*)"/);
                        const difficultyMatch = response.content.match(/"difficulty":\s*"([^"]*)"/);
                        
                        // Extract steps array
                        const stepsMatch = response.content.match(/"steps":\s*\[([\s\S]*?)\](?=,\s*"|$)/);
                        
                        // Build minimal valid JSON
                        const minimalJSON = {
                            title: titleMatch ? titleMatch[1] : "Learning Roadmap",
                            description: descriptionMatch ? descriptionMatch[1] : "A personalized learning roadmap.",
                            estimatedDuration: durationMatch ? durationMatch[1] : "3-6 months",
                            difficulty: difficultyMatch ? difficultyMatch[1] : "beginner",
                            steps: []
                        };
                        
                        // Try to parse steps if available
                        if (stepsMatch) {
                            try {
                                const stepsContent = `[${stepsMatch[1]}]`;
                                minimalJSON.steps = JSON.parse(stepsContent);
                            } catch (stepsError) {
                                console.warn('Could not parse steps array, using empty array');
                            }
                        }
                        
                        // If no steps were parsed, create a minimal step
                        if (minimalJSON.steps.length === 0) {
                            minimalJSON.steps = [{
                                title: "Step 1: Foundation",
                                description: "Start with the basics.",
                                duration: "1 week",
                                skills: ["Fundamentals"],
                                order: 1
                            }];
                        }
                        
                        parsedRoadmap = minimalJSON;
                        console.log('✅ Successfully reconstructed JSON from incomplete response');
                        
                    } catch (reconstructionError) {
                        if (retryCount === maxRetries - 1) {
                            console.error('Failed to parse AI response after retries:', response.content);
                            console.error('Parse error details:', parseError.message);
                            throw new Error('AI returned invalid JSON format');
                        }
                        
                        console.warn(`Parse attempt ${retryCount + 1} failed, retrying...`);
                        retryCount++;
                        continue;
                    }
                }

                // Validate the roadmap structure
                if (!parsedRoadmap.title || !parsedRoadmap.steps || !Array.isArray(parsedRoadmap.steps)) {
                    if (retryCount === maxRetries - 1) {
                        throw new Error('AI response missing required fields');
                    }
                    
                    console.warn(`Validation attempt ${retryCount + 1} failed, retrying...`);
                    retryCount++;
                    continue;
                }

                // If steps are fewer than 6, request steps-only fallback to ensure completeness
                if (parsedRoadmap.steps.length < 6) {
                    console.warn(`AI returned only ${parsedRoadmap.steps.length} steps; requesting steps-only completion...`);
                    const stepsOnlySystem = `Return ONLY valid JSON. Provide a complete 'steps' array of at least 6 items. Skip headings and extra description.`;
                    const stepsOnlyUser = `For goal "${goalData.name}" (${goalData.category}, ${goalData.difficulty}${goalData.estimatedTime ? `, ${goalData.estimatedTime}` : ''}), generate a complete steps array (min 6) with ordered items containing title, description, duration, and skills. Start order at 1.`;
                    const stepsResp = await callAI(stepsOnlyUser, stepsOnlySystem, { responseMimeType: 'application/json', responseSchema: stepsOnlySchema });
                    let stepsContent = stepsResp.content.trim().replace(/```json\s*/g, '').replace(/```\s*/g, '');
                    try {
                        const stepsObj = JSON.parse(stepsContent);
                        if (Array.isArray(stepsObj.steps) && stepsObj.steps.length >= 6) {
                            parsedRoadmap.steps = stepsObj.steps.map((s, idx) => ({ ...s, order: s.order || idx + 1 }));
                        } else {
                            console.warn('Steps-only fallback did not return enough steps; proceeding with original steps');
                        }
                    } catch (e) {
                        console.warn('Failed to parse steps-only fallback JSON; proceeding with original steps');
                    }
                }

                // Ensure steps have proper order
                parsedRoadmap.steps = parsedRoadmap.steps.map((step, index) => ({
                    ...step,
                    order: step.order || index + 1,
                }));

                // Generate course suggestions based on the roadmap
                let courseSuggestions = null;
                try {
                    const suggestionOptions = {
                        difficultyFilter: parsedRoadmap.difficulty,
                        maxSuggestions: 6,
                        minScore: 25,
                        goalCategory: goalData.category,
                        goalTags: goalData.tags || [],
                        goalSkills: [
                          ...(goalData.skillsRequired || []),
                          ...(goalData.skillsLearned || [])
                        ]
                    };
                    
                    courseSuggestions = await getCourseRecommendations(parsedRoadmap, suggestionOptions);
                    
                    if (!courseSuggestions.success || courseSuggestions.suggestions.length === 0) {
                        // Fallback to popular courses if no relevant suggestions found
                        const { getPopularCourses } = require('./courseSuggestionService');
                        const popularCourses = await getPopularCourses(parsedRoadmap.difficulty, 3);
                        courseSuggestions = {
                            success: true,
                            suggestions: popularCourses,
                            fallback: true,
                            message: 'Showing popular courses as no highly relevant courses were found'
                        };
                    }
                } catch (courseError) {
                    console.warn('Course suggestion generation failed:', courseError.message);
                    courseSuggestions = {
                        success: false,
                        error: courseError.message,
                        suggestions: [],
                        fallback: true
                    };
                }

                return {
                    success: true,
                    roadmap: parsedRoadmap,
                    courseSuggestions,
                    aiService: response.service,
                    aiModel: response.model,
                };
            } catch (error) {
                if (retryCount === maxRetries - 1) {
                    throw error;
                }
                
                console.warn(`Attempt ${retryCount + 1} failed, retrying...`);
                retryCount++;
            }
        }
    } catch (error) {
        console.error('Error generating roadmap:', error);
        throw error;
    }
}

/**
 * Enhance a user-submitted goal with AI suggestions
 */
async function enhanceGoal(goalText) {
    const systemPrompt = `You are an expert career counselor. Analyze the user's career goal and provide structured information to help categorize and understand it better.

Return ONLY valid JSON without any markdown formatting or explanatory text.`;

    const userPrompt = `Analyze this career/learning goal and return structured information:

Goal: "${goalText}"

Return a JSON object with this structure:
{
  "suggestedName": "string (clear, concise goal name)",
  "category": "string (one of: Web Development, Mobile Development, Data Science, Machine Learning, DevOps, Cybersecurity, UI/UX Design, Cloud Computing, Backend Development, Frontend Development, Full Stack Development, Game Development, Blockchain, Other)",
  "difficulty": "string (must be exactly one of: beginner, intermediate, advanced)",
  "estimatedTime": "string (e.g., '3-6 months')",
  "description": "string (2-3 sentence description)",
  "tags": ["string (relevant tag 1)", "string (relevant tag 2)", "string (relevant tag 3)"],
  "skillsRequired": ["string (prerequisite 1)", "string (prerequisite 2)"],
  "skillsLearned": ["string (skill 1)", "string (skill 2)", "string (skill 3)"]
}

CRITICAL: The difficulty field MUST be exactly one of these three values: "beginner", "intermediate", or "advanced". Do not use combined values like "beginner/intermediate".

Return ONLY the JSON object.`;

    try {
        const response = await callAI(userPrompt, systemPrompt, { responseMimeType: 'application/json' });

        let content = response.content.trim();
        content = content.replace(/```json\s*/g, '');
        content = content.replace(/```\s*/g, '');

        const enhancedGoal = JSON.parse(content);

        return {
            success: true,
            enhancedGoal,
            aiService: response.service,
        };
    } catch (error) {
        console.error('Error enhancing goal:', error);
        throw error;
    }
}

module.exports = {
    callAI,
    callGemini,
    generateRoadmap,
    enhanceGoal,
    // Newly added functions will be exported below
};

/**
 * Infer suitable job positions from a parsed resume using AI
 * Returns structured positions with typical requirements and confidence.
 */
async function inferPositionsFromResume(parsedResume) {
    const systemPrompt = `You are a job-matching assistant.

Return ONLY valid JSON. Identify the top 3 most suitable job positions based on the candidate's resume.
For each position, include typical requirements and a confidence score (0.0-1.0).
`;

    const userPrompt = `Candidate resume summary (normalized):
Skills: ${JSON.stringify(parsedResume.skills || [])}
Education: ${JSON.stringify(parsedResume.education || [])}
Experience lines: ${JSON.stringify(parsedResume.experience || [])}
Projects: ${JSON.stringify(parsedResume.projects || [])}

Return JSON with this exact structure:
{
  "positions": [
    {
      "title": "string",
      "typicalRequirements": {
        "skills": ["string"],
        "tools": ["string"],
        "experienceYearsRange": "string",
        "education": "string",
        "certifications": ["string"]
      },
      "confidence": 0.0,
      "rationale": "string"
    }
  ]
}`;

    const resp = await callAI(userPrompt, systemPrompt, { responseMimeType: 'application/json' });

    let content = resp.content.trim().replace(/```json\s*/g, '').replace(/```\s*/g, '');
    let data;
    try {
        data = JSON.parse(content);
    } catch (e) {
        throw new Error('Failed to parse AI positions JSON');
    }

    if (!data || !Array.isArray(data.positions)) {
        throw new Error('AI did not return positions array');
    }

    return {
        success: true,
        positions: data.positions,
        aiService: resp.service,
        aiModel: resp.model,
    };
}

/**
 * Generate actionable insights to bridge gaps between current skills and target requirements.
 */
async function generateGapInsights(currentSkills = [], targetRequirements = {}) {
    const systemPrompt = `You are a career coach. Provide concise, actionable guidance.
Return ONLY valid JSON with an array of insights, each including action, why, and suggested resources.`;

    const userPrompt = `Current skills: ${JSON.stringify(currentSkills)}
Target requirements: ${JSON.stringify(targetRequirements)}

Return JSON:
{
  "insights": [
    { "action": "string", "why": "string", "resources": ["string"], "timeline": "string" }
  ],
  "confidence": 0.0
}`;

    const resp = await callAI(userPrompt, systemPrompt, { responseMimeType: 'application/json' });
    let content = resp.content.trim().replace(/```json\s*/g, '').replace(/```\s*/g, '');
    let data;
    try {
        data = JSON.parse(content);
    } catch (e) {
        throw new Error('Failed to parse AI insights JSON');
    }

    if (!data || !Array.isArray(data.insights)) {
        throw new Error('AI did not return insights array');
    }

    return {
        success: true,
        insights: data.insights,
        confidence: typeof data.confidence === 'number' ? data.confidence : 0.7,
        aiService: resp.service,
        aiModel: resp.model,
    };
}

/**
 * Generate a resume-based personalized roadmap using AI
 * Includes milestones, learning paths, timeline suggestions, and resources.
 */
async function generateResumeRoadmap(parsedResume, targetPosition, targetRequirements = {}) {
    const systemPrompt = `You are an expert curriculum designer.
Return ONLY valid JSON. Personalize strictly to the candidate's resume and target position. Avoid generic advice.`;

    const userPrompt = `Candidate resume:
Skills: ${JSON.stringify(parsedResume.skills || [])}
Education: ${JSON.stringify(parsedResume.education || [])}
Experience: ${JSON.stringify(parsedResume.experience || [])}
Projects: ${JSON.stringify(parsedResume.projects || [])}

Target position: ${targetPosition}
Target requirements: ${JSON.stringify(targetRequirements)}

Return JSON with this structure:
{
  "title": "string",
  "description": "string",
  "estimatedDuration": "string",
  "difficulty": "string",
  "steps": [
    { "title": "string", "description": "string", "duration": "string", "skills": ["string"], "order": 1 }
  ],
  "skillsRequired": ["string"],
  "skillsLearned": ["string"],
  "tags": ["string"],
  "confidence": 0.0,
  "personalizationScore": 0.0
}`;

    const response = await callAI(userPrompt, systemPrompt, { responseMimeType: 'application/json' });
    let content = response.content.trim().replace(/```json\s*/g, '').replace(/```\s*/g, '');
    let roadmap;
    try {
        roadmap = JSON.parse(content);
    } catch (e) {
        throw new Error('Failed to parse AI roadmap JSON');
    }

    if (!roadmap || !Array.isArray(roadmap.steps)) {
        throw new Error('AI roadmap missing required steps');
    }

    // Ensure step ordering
    roadmap.steps = roadmap.steps.map((s, i) => ({ ...s, order: s.order || i + 1 }));

    return {
        success: true,
        roadmap,
        aiService: response.service,
        aiModel: response.model,
    };
}

module.exports.inferPositionsFromResume = inferPositionsFromResume;
module.exports.generateGapInsights = generateGapInsights;
module.exports.generateResumeRoadmap = generateResumeRoadmap;

