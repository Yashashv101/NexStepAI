const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const crypto = require('crypto');
const { cache } = require('../utils/cache');
const { analyzeSkillGap } = require('../utils/skillGapAnalyzer');
const { recommendCourses, recommendCoursesForPosition } = require('../utils/recommendationEngine');
const { inferPositionsFromResume, generateGapInsights } = require('../services/aiService');
const { matchSkillsInText, canonicalizeSkills } = require('../utils/skillsDB');

// Deprecated: replaced by skillsDB-based matching to reduce false negatives
const SKILL_KEYWORDS = [];

function normalizeTokens(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\+\.#\-\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function extractTextFromBuffer(file) {
  const mime = file.mimetype;
  if (mime === 'application/pdf') {
    return pdfParse(file.buffer).then(res => res.text);
  }
  if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return mammoth.extractRawText({ buffer: file.buffer }).then(res => res.value || '');
  }
  if (mime === 'text/plain') {
    return Promise.resolve(file.buffer.toString('utf8'));
  }
  return Promise.reject(new Error(`Unsupported file type: ${mime}`));
}

function parseResumeText(text) {
  const tokens = normalizeTokens(text);
  const tokenSet = new Set(tokens);
  // Extract skills using regex-based matching and canonicalization
  const skills = canonicalizeSkills(matchSkillsInText(text));

  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = text.match(/(?:\+\d{1,3}[\s-]?)?(?:\(?\d{3}\)?[\s-]?)?\d{3}[\s-]?\d{4}/);

  const degreeKeywords = ['bachelor','master','phd','b.tech','m.tech','bsc','msc','bs','ms','be','me','mba','degree','diploma'];
  const education = degreeKeywords.filter(d => tokenSet.has(d));

  // Experience section heuristic
  const expSections = [];
  const lines = (text || '').split(/\r?\n/);
  let capture = false;
  for (const line of lines) {
    const l = line.toLowerCase();
    if (/experience|work history|employment/i.test(l)) {
      capture = true; continue;
    }
    if (capture && /education|skills|projects|certifications/i.test(l)) {
      capture = false; continue;
    }
    if (capture) expSections.push(line.trim());
  }

  // Projects section heuristic
  const projectSections = [];
  capture = false;
  for (const line of lines) {
    const l = line.toLowerCase();
    if (/projects|project experience|selected projects/i.test(l)) {
      capture = true; continue;
    }
    if (capture && /education|skills|experience|work history|employment|certifications/i.test(l)) {
      capture = false; continue;
    }
    if (capture) projectSections.push(line.trim());
  }

  return {
    email: emailMatch ? emailMatch[0] : null,
    phone: phoneMatch ? phoneMatch[0] : null,
    skills,
    education,
    experience: expSections.slice(0, 20),
    projects: projectSections.slice(0, 20),
  };
}

function extractTargetSkills(requirementsText, requirementsList) {
  let targets = [];
  if (Array.isArray(requirementsList) && requirementsList.length) {
    targets = canonicalizeSkills(requirementsList);
  } else if (requirementsText) {
    targets = canonicalizeSkills(matchSkillsInText(requirementsText));
  }
  // Dedup
  const seen = new Set();
  return targets.filter(t => { if (seen.has(t)) return false; seen.add(t); return true; });
}

function generateSimpleRoadmap(currentSkills = [], targetSkills = [], profile = {}) {
  const current = new Set((currentSkills || []).map(s => String(s).toLowerCase()));
  const target = (targetSkills || []).map(s => String(s).toLowerCase());
  const missing = target.filter(t => !current.has(t));

  // Determine proficiency based on presence in experience/projects text
  const combinedLines = [
    ...(Array.isArray(profile.experience) ? profile.experience : []),
    ...(Array.isArray(profile.projects) ? profile.projects : []),
  ].join('\n').toLowerCase();

  const proficient = new Set();
  for (const skill of current) {
    const re = new RegExp(`\\b${skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '')}\\b`, 'i');
    if (re.test(combinedLines)) {
      proficient.add(skill);
    }
  }

  const steps = [];
  // If user has proficiency signals, start at advanced level
  const startAdvanced = proficient.size > 0;

  // Step 1: Advanced Architecture & Patterns or Focused Fundamentals
  steps.push({
    title: startAdvanced ? 'Advanced Architecture & Patterns' : 'Focused Fundamentals',
    description: startAdvanced
      ? 'Consolidate advanced patterns, architectural decisions, and best practices across your core stack.'
      : 'Quickly align foundational concepts for your target stack to eliminate gaps.',
    duration: startAdvanced ? '1-2 weeks' : '1-2 weeks',
    skills: startAdvanced ? Array.from(proficient).slice(0, 6) : Array.from(current).slice(0, 6),
    order: 1,
  });

  // Step 2: Core Technologies Deep Dive (cover highest-priority missing skills)
  steps.push({
    title: 'Core Technologies Deep Dive',
    description: 'Hands-on learning for top missing technologies with guided exercises and mini-projects.',
    duration: '1-2 weeks',
    skills: missing.slice(0, 3),
    order: 2,
  });

  // Step 3: Production Quality — Testing, Performance, and Deployment
  steps.push({
    title: 'Production Quality: Testing & Performance',
    description: 'Implement testing strategy, optimize performance, and prepare for deployment best practices.',
    duration: '1-2 weeks',
    skills: ['testing', 'performance', 'deployment'].filter(s => s),
    order: 3,
  });

  // Step 4: Capstone Project with Real-World Constraints
  steps.push({
    title: 'Capstone Project',
    description: 'Build a portfolio-grade project integrating advanced patterns and target technologies.',
    duration: '2 weeks',
    skills: (missing.length ? missing : Array.from(current)).slice(0, 5),
    order: 4,
  });

  return {
    title: 'Personalized Learning Path',
    description: 'A practical roadmap tailored to your current skills and goals.',
    estimatedDuration: '4-8 weeks',
    difficulty: startAdvanced ? 'intermediate' : (current.size < 5 ? 'beginner' : 'intermediate'),
    steps,
    skillsRequired: target.slice(0, 6),
    skillsLearned: missing,
    tags: ['roadmap', 'skill-gap', 'learning-path']
  };
}

// @desc    Analyze uploaded resume and return parsing + recommendations
// @route   POST /api/resumes/analyze
// @access  Private (recommended) but currently public unless auth middleware added in routes
exports.analyzeResume = async (req, res) => {
  try {
    const file = req.file;
    const { requirementsText, requirements } = req.body || {};

    if (!file) {
      return res.status(400).json({ success: false, message: 'Please upload a resume file under field name "resume"' });
    }

    const text = await extractTextFromBuffer(file);
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Could not extract text from resume. Ensure the file is not password-protected or corrupted.' });
    }

    const parsed = parseResumeText(text);

    // Build cache key using resume text hash + requirements hash
    const resumeHash = crypto.createHash('sha256').update(text).digest('hex');
    const reqKeyRaw = Array.isArray(requirements) && requirements.length
      ? JSON.stringify(requirements)
      : (requirementsText || '');
    const reqHash = crypto.createHash('sha256').update(reqKeyRaw).digest('hex');
    const cacheKey = `resume:analysis:${resumeHash}:${reqHash}`;

    const analysis = await cache.getOrSet(cacheKey, async () => {
      const targetSkills = extractTargetSkills(requirementsText, requirements);

      // Case 1: No specified goal/requirements -> infer positions via AI and analyze gaps
      if (!requirementsText && (!Array.isArray(requirements) || requirements.length === 0)) {
        // Try AI-based position inference; fall back to heuristic if AI not configured
        let positions = [];
        try {
          const aiPositions = await inferPositionsFromResume(parsed);
          positions = aiPositions.positions.map((pos) => {
            const reqSkills = (pos?.typicalRequirements?.skills || []).map(s => String(s).toLowerCase());
            const gap = analyzeSkillGap(parsed.skills, reqSkills);
            const recs = recommendCoursesForPosition(parsed.skills, reqSkills, pos.title || '');
            return {
              title: pos.title,
              confidence: typeof pos.confidence === 'number' ? pos.confidence : 0.7,
              rationale: pos.rationale || '',
              typicalRequirements: pos.typicalRequirements || { skills: [], tools: [], experienceYearsRange: '', education: '', certifications: [] },
              skillGap: { ...gap, confidence: gap.missing.length ? Math.min(1, gap.matched.length / (gap.missing.length + gap.matched.length || 1)) : 0.8 },
              recommendations: recs,
            };
          });
        } catch (e) {
          // Heuristic position inference
          const skills = (parsed.skills || []).map(s => s.toLowerCase());
          const has = (k) => skills.includes(k);
          const suggested = [];
          const pushPos = (title, reqSkills) => {
            const gap = analyzeSkillGap(parsed.skills, reqSkills);
            const recs = recommendCoursesForPosition(parsed.skills, reqSkills, title);
            suggested.push({
              title,
              confidence: 0.6,
              rationale: 'Inferred from resume skills without AI service',
              typicalRequirements: { skills: reqSkills, tools: [], experienceYearsRange: '1-3 years', education: '', certifications: [] },
              skillGap: { ...gap, confidence: gap.missing.length ? Math.min(1, gap.matched.length / (gap.missing.length + gap.matched.length || 1)) : 0.75 },
              recommendations: recs,
            });
          };
          if (has('react') || has('html') || has('css') || has('frontend')) {
            pushPos('Frontend Developer', ['react','javascript','html','css','testing']);
          }
          if (has('node') || has('express') || has('backend')) {
            pushPos('Backend Developer', ['node','express','sql','mongodb','rest']);
          }
          if (has('android') || has('kotlin') || has('flutter')) {
            pushPos('Android Developer', ['android','kotlin','java','git']);
          }
          if (has('ios') || has('swift')) {
            pushPos('iOS Developer', ['ios','swift','xcode','git']);
          }
          if (has('tensorflow') || has('pytorch') || has('sklearn') || has('machine') || has('data')) {
            pushPos('Machine Learning Engineer', ['python','numpy','pandas','tensorflow','pytorch']);
          }
          if (suggested.length === 0) {
            pushPos('Full Stack Developer', ['react','node','javascript','sql']);
          }
          positions = suggested.slice(0, 3);
        }

        // Roadmap generation must be gated by a clear goal specification
        return {
          mode: 'inferred-positions',
          parsed,
          positions,
          aiMeta: { service: 'gemini', model: 'resume-job-infer' },
          aiRoadmapAvailable: false,
          roadmapUnavailableReason: 'Roadmap generation requires a specified career goal.',
          roadmapPreview: null,
        };
      }

      // Case 2: Specified goal/requirements -> detailed gap analysis with insights
      const gap = analyzeSkillGap(parsed.skills, targetSkills);
      const targetReq = { skills: targetSkills, description: requirementsText || '' };
      // Try AI insights; fall back to heuristic suggestions if AI not configured
      let insights;
      try {
        insights = await generateGapInsights(parsed.skills, targetReq);
      } catch (e) {
        const tips = (gap.missing || []).slice(0, 6).map(ms => ({
          action: `Learn ${ms}`,
          why: 'Required for your target role and currently missing from your skill set.',
          resources: [`Search: ${ms} course`, `Documentation: ${ms}`],
          timeline: '1-2 weeks per skill with practice'
        }));
        insights = { success: true, insights: tips, confidence: 0.5, aiService: 'heuristic', aiModel: 'simple-fallback' };
      }
      const recs = recommendCoursesForPosition(parsed.skills, targetSkills, (requirementsText || 'Target Role'));
      const roadmapPreview = generateSimpleRoadmap(parsed.skills, targetSkills, parsed);

      return {
        mode: 'specified-goal',
        parsed,
        target: targetReq,
        targetSkills,
        skillGap: { ...gap, confidence: gap.missing.length ? Math.min(1, gap.matched.length / (gap.missing.length + gap.matched.length || 1)) : 0.85 },
        insights,
        recommendations: recs,
        aiRoadmapAvailable: true,
        roadmapPreview,
      };
    }, 10 * 60 * 1000); // cache for 10 minutes

    return res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    console.error('Resume analysis error:', error);
    const message = error.message || 'Server error while processing resume';
    return res.status(500).json({ success: false, message });
  }
};

// @desc    Generate AI-powered roadmap from parsed resume and selected target position
// @route   POST /api/resumes/roadmap
// @access  Private
exports.generateRoadmapFromResume = async (req, res) => {
  try {
    const { parsed, targetPosition, targetRequirements } = req.body || {};
    if (!parsed || !Array.isArray(parsed.skills) || parsed.skills.length === 0) {
      return res.status(400).json({ success: false, message: 'Resume parsing required before generating a roadmap' });
    }
    if (!targetPosition && !(targetRequirements && Array.isArray(targetRequirements.skills) && targetRequirements.skills.length > 0)) {
      return res.status(400).json({ success: false, message: 'Roadmap generation requires a specified career goal' });
    }

    const { generateResumeRoadmap } = require('../services/aiService');
    try {
      const result = await generateResumeRoadmap(parsed, targetPosition, targetRequirements || {});
      return res.status(200).json({ success: true, data: result });
    } catch (e) {
      // Fallback to simple roadmap if AI not configured or fails
      const reqSkills = (targetRequirements?.skills || []).map(s => String(s).toLowerCase());
      const gap = analyzeSkillGap(parsed.skills, reqSkills);
      const roadmap = generateSimpleRoadmap(parsed.skills, reqSkills, parsed);
      roadmap.title = `${targetPosition || 'Target Role'} Roadmap (Fallback)`;
      roadmap.description = roadmap.description || `A simple roadmap towards ${targetPosition || 'your target role'} based on your current skills.`;
      roadmap.confidence = 0.5;
      roadmap.personalizationScore = 0.5;
      return res.status(200).json({ success: true, data: { success: true, roadmap, skills: { matched: gap.matched, missing: gap.missing, irrelevant: gap.irrelevant }, aiService: 'heuristic', aiModel: 'simple-fallback' } });
    }
  } catch (error) {
    console.error('Resume roadmap generation error:', error);
    const message = error.message || 'Server error while generating roadmap';
    return res.status(500).json({ success: false, message });
  }
};