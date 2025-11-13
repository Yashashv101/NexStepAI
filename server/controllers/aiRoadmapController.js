const Goal = require('../models/Goal');
const Roadmap = require('../models/Roadmap');
const Activity = require('../models/Activity');
const { generateRoadmap, enhanceGoal } = require('../services/aiService');
const { getCourseSuggestions: getCourseSuggestionsService, recordCourseFeedback: recordCourseFeedbackService } = require('../services/courseSuggestionService');
const fs = require('fs');
const path = require('path');

// Helpers: parse availability and convert duration strings to week ranges
function parseHoursPerWeek(input) {
  if (!input || typeof input !== 'string') return 0;
  const cleaned = input.toLowerCase().trim();
  // Extract numbers, handle ranges like "8-12"
  const rangeMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)/);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);
    if (!isNaN(min) && !isNaN(max) && min > 0 && max > 0) {
      // Use midpoint for planning; still store min/max if needed later
      return Math.round(((min + max) / 2) * 10) / 10;
    }
  }
  const singleMatch = cleaned.match(/(\d+(?:\.\d+)?)/);
  if (singleMatch) {
    const val = parseFloat(singleMatch[1]);
    return isNaN(val) ? 0 : val;
  }
  return 0;
}

function durationToWeekRange(durationStr) {
  if (!durationStr || typeof durationStr !== 'string') return { minWeeks: 0, maxWeeks: 0 };
  const s = durationStr.toLowerCase().trim();
  // Normalize common forms: "X weeks", "X-Y weeks", "1 month", "X-Y months"
  const weekRange = s.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*week/);
  if (weekRange) {
    const min = parseFloat(weekRange[1]);
    const max = parseFloat(weekRange[2]);
    return { minWeeks: isNaN(min) ? 0 : min, maxWeeks: isNaN(max) ? 0 : max };
  }
  const weekSingle = s.match(/(\d+(?:\.\d+)?)\s*week/);
  if (weekSingle) {
    const w = parseFloat(weekSingle[1]);
    return { minWeeks: isNaN(w) ? 0 : w, maxWeeks: isNaN(w) ? 0 : w };
  }
  const monthRange = s.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*month/);
  if (monthRange) {
    const minM = parseFloat(monthRange[1]);
    const maxM = parseFloat(monthRange[2]);
    const minW = isNaN(minM) ? 0 : minM * 4; // approximate 4 weeks per month
    const maxW = isNaN(maxM) ? 0 : maxM * 4;
    return { minWeeks: minW, maxWeeks: maxW };
  }
  const monthSingle = s.match(/(\d+(?:\.\d+)?)\s*month/);
  if (monthSingle) {
    const m = parseFloat(monthSingle[1]);
    const w = isNaN(m) ? 0 : m * 4;
    return { minWeeks: w, maxWeeks: w };
  }
  return { minWeeks: 0, maxWeeks: 0 };
}

// Course recommendations integration
// Resolve absolute path for Courses.py across Windows/Unix style paths
function resolveCoursesPyPath() {
  const candidates = [
    // Windows absolute path variants
    'C\\\\Users\\\\yasha\\\\Documents\\\\NexStepAI\\\\ai-ml\\\\modules\\\\Courses.py',
    'C:/Users/yasha/Documents/NexStepAI/ai-ml/modules/Courses.py',
    '/C:/Users/yasha/Documents/NexStepAI/ai-ml/modules/Courses.py',
    // Repo-relative fallbacks
    path.resolve(__dirname, '../../ai-ml/modules/Courses.py'),
    path.resolve(process.cwd(), 'ai-ml/modules/Courses.py')
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        return p;
      }
    } catch (_) {
      // ignore
    }
  }
  return null;
}

// Parse course lists from Courses.py (lists of [title, url]) grouped by category variable name
function parseCoursesPy(pyContent) {
  if (!pyContent || typeof pyContent !== 'string') return null;
  const lines = pyContent.split(/\r?\n/);
  const data = {};
  let currentKey = null;
  let inList = false;
  for (let rawLine of lines) {
    const line = rawLine.trim();
    // Start of a course list (we only consider *_course variables)
    const startMatch = line.match(/^([A-Za-z0-9_]+)_course\s*=\s*\[/);
    if (startMatch) {
      currentKey = startMatch[1] + '_course';
      data[currentKey] = [];
      inList = true;
      continue;
    }
    if (inList) {
      // End of list
      if (line === ']' || line === '],') {
        inList = false;
        currentKey = null;
        continue;
      }
      // Match course pair: ['Title', 'URL'] or ["Title", "URL"]
      const pairMatch = line.match(/\[\s*(['"])(.*?)\1\s*,\s*(['"])(.*?)\3\s*\]/);
      if (pairMatch && currentKey) {
        const title = pairMatch[2];
        const url = pairMatch[4];
        if (title && url) {
          data[currentKey].push({ title, url });
        }
      }
    }
  }
  // Ensure we found at least one course list
  const keys = Object.keys(data).filter(k => Array.isArray(data[k]) && data[k].length > 0);
  if (keys.length === 0) return null;
  return data;
}

// Map goal categories or keywords to Courses.py keys
function inferCourseCategory(goalCategory, keywords = []) {
  const c = (goalCategory || '').toLowerCase();
  const kw = (keywords || []).map(k => String(k).toLowerCase());
  const hasAny = (arr) => kw.some(k => arr.some(a => k.includes(a) || a.includes(k)));

  if (c.includes('data') || c.includes('ml') || c.includes('machine')) return 'ds_course';
  if (c.includes('web') || c.includes('frontend') || c.includes('full stack')) return 'web_course';
  if (c.includes('android') || hasAny(['android', 'kotlin'])) return 'android_course';
  if (c.includes('ios') || c.includes('swift') || hasAny(['swift', 'ios'])) return 'ios_course';
  if (c.includes('ux') || c.includes('ui') || c.includes('design') || hasAny(['ux', 'ui', 'design'])) return 'uiux_course';
  // Fallback: choose based on keywords
  if (hasAny(['react', 'node', 'django', 'flask'])) return 'web_course';
  if (hasAny(['tensorflow', 'data', 'machine'])) return 'ds_course';
  return null;
}

function tokenize(text) {
  if (!text) return [];
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9+\-\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function computeRelevance(courseTitle, goalCategory, keywords) {
  const title = String(courseTitle || '').toLowerCase();
  let score = 0;
  const reasons = [];
  if (goalCategory && title.includes(goalCategory.toLowerCase())) {
    score += 30;
    reasons.push('Matches goal category');
  }
  const matched = [];
  for (const kw of (keywords || [])) {
    if (kw.length > 2 && title.includes(kw)) {
      score += 10;
      matched.push(kw);
    }
  }
  if (matched.length) reasons.push(`Keyword match: ${matched.join(', ')}`);
  return { score, matched };
}

function buildCourseRecommendations(goal, roadmap, pyCourses) {
  try {
    if (!pyCourses) return [];
    // Collect keywords from steps and goal tags/skills
    const stepKeywords = new Set();
    const addTokens = (val) => tokenize(val).forEach(t => stepKeywords.add(t));
    if (Array.isArray(roadmap?.steps)) {
      for (const s of roadmap.steps) {
        addTokens(s?.title);
        addTokens(s?.description);
        if (Array.isArray(s?.skills)) s.skills.forEach(addTokens);
      }
    }
    if (Array.isArray(goal?.tags)) goal.tags.forEach(addTokens);
    if (Array.isArray(goal?.skillsRequired)) goal.skillsRequired.forEach(addTokens);
    if (Array.isArray(goal?.skillsLearned)) goal.skillsLearned.forEach(addTokens);
    const keywords = Array.from(stepKeywords);

    const categoryKey = inferCourseCategory(goal?.category, keywords);
    if (!categoryKey || !pyCourses[categoryKey] || pyCourses[categoryKey].length === 0) {
      return [];
    }

    // Deduplicate by title
    const seen = new Set();
    const candidates = pyCourses[categoryKey].filter(c => {
      const key = (c.title || '').trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Score and pick top matches
    const scored = candidates.map(c => {
      const { score, matched } = computeRelevance(c.title, goal?.category, keywords);
      return {
        title: c.title,
        url: c.url,
        category: categoryKey,
        relevanceScore: score,
        relevanceReasons: matched.length ? [`Keyword match: ${matched.join(', ')}`] : (goal?.category ? ['Goal category alignment'] : []),
        description: matched.length ? `Covers ${matched.join(', ')} topics relevant to your roadmap.` : 'Relevant course for your goal category.'
      };
    });

    // Sort by relevance and select top 5
    scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
    const top = scored.slice(0, 5).filter(r => r.relevanceScore > 0);
    return top;
  } catch (err) {
    // Graceful fallback: no recommendations
    return [];
  }
}

// @desc    Submit a user goal and get AI enhancement suggestions
// @route   POST /api/ai/enhance-goal
// @access  Private
exports.enhanceUserGoal = async (req, res) => {
  try {
    const { goalText } = req.body;

    if (!goalText || goalText.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid goal description (at least 10 characters)'
      });
    }

    // Call AI to enhance the goal
    const result = await enhanceGoal(goalText);

    res.status(200).json({
      success: true,
      data: result.enhancedGoal,
      aiService: result.aiService
    });
  } catch (error) {
    console.error('Error enhancing goal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enhance goal. Please try again.',
      error: error.message
    });
  }
};

// @desc    Create a user-submitted goal (with optional AI enhancement)
// @route   POST /api/ai/create-user-goal
// @access  Private
exports.createUserGoal = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      difficulty,
      estimatedTime,
      tags,
      skillsRequired,
      skillsLearned,
      originalGoalText,
      isAIEnhanced
    } = req.body;

    // Validate required fields
    if (!name || !description || !category || !difficulty || !estimatedTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate difficulty enum values
    const validDifficulties = ['beginner', 'intermediate', 'advanced'];
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: `Invalid difficulty level. Must be one of: ${validDifficulties.join(', ')}`
      });
    }

    // Create the goal with user submission flag
    const goal = await Goal.create({
      name,
      description,
      category,
      difficulty,
      estimatedTime,
      tags: tags || [],
      skillsRequired: skillsRequired || [],
      skillsLearned: skillsLearned || [],
      createdBy: req.user.id,
      isUserSubmitted: true,
      isAIEnhanced: isAIEnhanced || false,
      aiMetadata: isAIEnhanced ? {
        service: req.body.aiService || 'manual',
        enhancedAt: new Date(),
        originalText: originalGoalText || name
      } : undefined,
      moderationStatus: 'approved' // Auto-approve for now, can change to 'pending'
    });

    // Create activity log
    await Activity.createActivity({
      userId: req.user.id,
      type: 'goal_created',
      title: `Created goal: ${name}`,
      description: `New user-submitted ${difficulty} level goal in ${category}`,
      metadata: {
        goalId: goal._id,
        isAIEnhanced
      },
      icon: 'target',
      color: 'green'
    });

    res.status(201).json({
      success: true,
      data: goal
    });
  } catch (error) {
    console.error('Error creating user goal:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Generate AI roadmap for a goal
// @route   POST /api/ai/generate-roadmap
// @access  Private
exports.generateAIRoadmap = async (req, res) => {
  try {
    const { goalId, userContext } = req.body;

    if (!goalId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a goal ID'
      });
    }

    // Fetch the goal
    const goal = await Goal.findById(goalId);
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Prepare goal data for AI
    const goalData = {
      name: goal.name,
      description: goal.description,
      category: goal.category,
      difficulty: goal.difficulty,
      estimatedTime: goal.estimatedTime,
      tags: goal.tags,
      skillsRequired: goal.skillsRequired,
      skillsLearned: goal.skillsLearned
    };

    // Generate roadmap using AI
    console.log(`Generating AI roadmap for goal: ${goal.name}`);
    const result = await generateRoadmap(goalData, userContext || {});

    // Attempt to load course data and build recommendations
    let courseRecommendations = [];
    const coursesPath = resolveCoursesPyPath();
    if (coursesPath) {
      try {
        const content = fs.readFileSync(coursesPath, 'utf-8');
        const pyCourses = parseCoursesPy(content);
        if (pyCourses) {
          courseRecommendations = buildCourseRecommendations(goal, result.roadmap, pyCourses);
        }
      } catch (_) {
        // Silent fallback: if parsing fails, proceed without recommendations
        courseRecommendations = [];
      }
    }

    res.status(200).json({
      success: true,
      data: {
        roadmap: result.roadmap,
        goalId: goal._id,
        goalName: goal.name,
        courseRecommendations
      },
      aiService: result.aiService,
      aiModel: result.aiModel
    });
  } catch (error) {
    console.error('Error generating AI roadmap:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate roadmap. Please try again.',
      error: error.message
    });
  }
};

// @desc    Save AI-generated roadmap
// @route   POST /api/ai/save-roadmap
// @access  Private
exports.saveAIRoadmap = async (req, res) => {
  try {
    const {
      goalId,
      roadmapData,
      aiService,
      aiModel,
      timeAvailability
    } = req.body;

    // Validate required fields
    if (!goalId || !roadmapData) {
      return res.status(400).json({
        success: false,
        message: 'Please provide goal ID and roadmap data'
      });
    }

    // Verify goal exists
    const goal = await Goal.findById(goalId);
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Validate roadmapData contains a minimum set of steps
    if (!roadmapData.steps || !Array.isArray(roadmapData.steps) || roadmapData.steps.length < 4) {
      return res.status(400).json({
        success: false,
        message: 'Roadmap generation incomplete: please ensure at least 4 steps before saving.'
      });
    }

    // Check if user already has a roadmap for this goal
    const existingRoadmap = await Roadmap.findOne({
      userId: req.user.id,
      goalId: goalId
    });

    if (existingRoadmap) {
      return res.status(400).json({
        success: false,
        message: 'You already have a roadmap for this goal. Please complete or delete the existing one first.'
      });
    }

    // Parse and validate time availability
    const hoursPerWeek = parseHoursPerWeek(timeAvailability);
    if (hoursPerWeek < 0 || hoursPerWeek > 168) {
      return res.status(400).json({
        success: false,
        message: 'Invalid time availability. Please provide a value between 0 and 168 hours/week.'
      });
    }

    // Precompute estimated hours for each step based on duration and availability
    const computedSteps = roadmapData.steps.map((step, index) => {
      const { minWeeks, maxWeeks } = durationToWeekRange(step.duration);
      // Validate week values
      const sanitizedMinWeeks = Number.isFinite(minWeeks) && minWeeks >= 0 ? minWeeks : 0;
      const sanitizedMaxWeeks = Number.isFinite(maxWeeks) && maxWeeks >= sanitizedMinWeeks ? maxWeeks : sanitizedMinWeeks;
      const weeklyHours = step.weeklyHours && step.weeklyHours > 0 ? step.weeklyHours : hoursPerWeek;
      const minHours = Math.round(sanitizedMinWeeks * weeklyHours);
      const maxHours = Math.round(sanitizedMaxWeeks * weeklyHours);
      const midpointHours = Math.round(((minHours + maxHours) / 2));

      return {
        ...step,
        order: step.order || index + 1,
        completed: false,
        weeklyHours: weeklyHours || undefined,
        estimatedHours: midpointHours,
        estimatedHoursMin: minHours,
        estimatedHoursMax: maxHours
      };
    });

    // Create the roadmap with AI metadata
    const roadmap = await Roadmap.create({
      title: roadmapData.title,
      description: roadmapData.description,
      goalId,
      userId: req.user.id,
      difficulty: roadmapData.difficulty || goal.difficulty,
      estimatedDuration: roadmapData.estimatedDuration,
      category: goal.category,
      timeAvailabilityHoursPerWeek: hoursPerWeek || 0,
      steps: computedSteps,
      tags: roadmapData.tags || goal.tags || [],
      skillsRequired: roadmapData.skillsRequired || goal.skillsRequired || [],
      skillsLearned: roadmapData.skillsLearned || goal.skillsLearned || [],
      status: 'not_started',
      isAIGenerated: true,
      aiMetadata: {
        service: (aiService && ['gemini', 'manual'].includes(aiService)) ? aiService : 'gemini',
        model: aiModel || 'unknown',
        generatedAt: new Date(),
        prompt: `Generated for goal: ${goal.name}${hoursPerWeek ? ` | Availability: ${hoursPerWeek} hours/week` : ''}`
      },
      moderationStatus: 'approved', // Auto-approve, can change to 'pending'
      isPublic: false
    });

    // Create activity log
    await Activity.createActivity({
      userId: req.user.id,
      type: 'roadmap_started',
      title: `Started AI-generated roadmap: ${roadmapData.title}`,
      description: `New ${roadmap.difficulty} level roadmap created with AI assistance`,
      metadata: {
        roadmapId: roadmap._id,
        goalId: goalId,
        isAIGenerated: true,
        aiService
      },
      icon: 'sparkles',
      color: 'purple'
    });

    res.status(201).json({
      success: true,
      data: roadmap
    });
  } catch (error) {
    console.error('Error saving AI roadmap:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get user's AI generation stats
// @route   GET /api/ai/user-stats
// @access  Private
exports.getUserAIStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Count AI-generated roadmaps
    const aiRoadmapsCount = await Roadmap.countDocuments({
      userId,
      isAIGenerated: true
    });

    // Count user-submitted goals
    const userGoalsCount = await Goal.countDocuments({
      createdBy: userId,
      isUserSubmitted: true
    });

    res.status(200).json({
      success: true,
      data: {
        aiRoadmapsGenerated: aiRoadmapsCount,
        userGoalsSubmitted: userGoalsCount
      }
    });
  } catch (error) {
    console.error('Error getting user AI stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user AI stats',
      error: error.message
    });
  }
};

// Admin functions

// @desc    Get all AI-generated roadmaps (admin)
// @route   GET /api/ai/admin/roadmaps
// @access  Admin
exports.getAllAIRoadmaps = async (req, res) => {
  try {
    const { 
      moderationStatus, 
      page = 1, 
      limit = 20 
    } = req.query;

    let query = { isAIGenerated: true };

    if (moderationStatus && moderationStatus !== 'all') {
      query.moderationStatus = moderationStatus;
    }

    const roadmaps = await Roadmap.find(query)
      .populate('goalId', 'name category')
      .populate('userId', 'name email')
      .populate('moderatedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Roadmap.countDocuments(query);

    res.status(200).json({
      success: true,
      count: roadmaps.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: roadmaps
    });
  } catch (error) {
    console.error('Error fetching AI roadmaps:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all user-submitted goals (admin)
// @route   GET /api/ai/admin/user-goals
// @access  Admin
exports.getAllUserGoals = async (req, res) => {
  try {
    const { 
      moderationStatus, 
      page = 1, 
      limit = 20 
    } = req.query;

    let query = { isUserSubmitted: true };

    if (moderationStatus && moderationStatus !== 'all') {
      query.moderationStatus = moderationStatus;
    }

    const goals = await Goal.find(query)
      .populate('createdBy', 'name email')
      .populate('moderatedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Goal.countDocuments(query);

    res.status(200).json({
      success: true,
      count: goals.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: goals
    });
  } catch (error) {
    console.error('Error fetching user goals:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Moderate a roadmap (admin)
// @route   PUT /api/ai/admin/moderate-roadmap/:id
// @access  Admin
exports.moderateRoadmap = async (req, res) => {
  try {
    const { moderationStatus, moderationNotes } = req.body;

    if (!['approved', 'rejected', 'flagged', 'pending'].includes(moderationStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid moderation status'
      });
    }

    const roadmap = await Roadmap.findByIdAndUpdate(
      req.params.id,
      {
        moderationStatus,
        moderationNotes,
        moderatedBy: req.user.id,
        moderatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('userId', 'name email');

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found'
      });
    }

    res.status(200).json({
      success: true,
      data: roadmap
    });
  } catch (error) {
    console.error('Error moderating roadmap:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Moderate a goal (admin)
// @route   PUT /api/ai/admin/moderate-goal/:id
// @access  Admin
exports.moderateGoal = async (req, res) => {
  try {
    const { moderationStatus, moderationNotes } = req.body;

    if (!['approved', 'rejected', 'flagged', 'pending'].includes(moderationStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid moderation status'
      });
    }

    const goal = await Goal.findByIdAndUpdate(
      req.params.id,
      {
        moderationStatus,
        moderationNotes,
        moderatedBy: req.user.id,
        moderatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    res.status(200).json({
      success: true,
      data: goal
    });
  } catch (error) {
    console.error('Error moderating goal:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get course suggestions based on roadmap content
// @route   POST /api/ai/course-suggestions
// @access  Private
exports.getCourseSuggestions = async (req, res) => {
  try {
    const { roadmapContent, difficulty, maxSuggestions = 5, minScore = 0.3 } = req.body;

    if (!roadmapContent) {
      return res.status(400).json({
        success: false,
        message: 'Roadmap content is required'
      });
    }

    // Get course suggestions from the service
    const result = await getCourseSuggestionsService(roadmapContent, {
      difficulty,
      maxSuggestions,
      minScore,
      userId: req.user.id
    });

    // Handle the case when no courses are found
    if (result.success && result.suggestions.length === 0 && result.actionableFeedback) {
      return res.status(200).json({
        success: true,
        data: {
          suggestions: [],
          count: 0,
          message: result.message,
          actionableFeedback: result.actionableFeedback,
          analysis: result.analysis,
          generatedAt: new Date()
        }
      });
    }

    // Handle fallback courses (when popular courses are returned instead of matches)
    if (result.success && result.suggestions.length > 0 && result.suggestions.some(course => course.isPopularFallback)) {
      return res.status(200).json({
        success: true,
        data: {
          suggestions: result.suggestions,
          count: result.suggestions.length,
          message: result.message,
          isFallback: true,
          analysis: result.analysis,
          generatedAt: new Date()
        }
      });
    }

    // Standard successful response
    res.status(200).json({
      success: true,
      data: {
        suggestions: result.suggestions || [],
        count: result.suggestions ? result.suggestions.length : 0,
        analysis: result.analysis,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error getting course suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Record feedback for a course suggestion
// @route   POST /api/ai/course-feedback
// @access  Private
exports.recordCourseFeedback = async (req, res) => {
  try {
    const { courseId, feedback, roadmapId, suggestionId } = req.body;

    if (!courseId || !feedback) {
      return res.status(400).json({
        success: false,
        message: 'Course ID and feedback are required'
      });
    }

    if (!['helpful', 'not_helpful', 'irrelevant'].includes(feedback)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feedback type. Must be: helpful, not_helpful, or irrelevant'
      });
    }

    // Record the feedback
    await recordCourseFeedbackService(courseId, feedback, {
      userId: req.user.id,
      roadmapId,
      suggestionId
    });

    res.status(200).json({
      success: true,
      message: 'Feedback recorded successfully'
    });
  } catch (error) {
    console.error('Error recording course feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = exports;

