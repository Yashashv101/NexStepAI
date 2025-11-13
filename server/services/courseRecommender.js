const fs = require('fs');
const path = require('path');

// Resolve absolute path for Courses.py across Windows/Unix style paths
function resolveCoursesPyPath() {
  const candidates = [
    'C\\\\Users\\\\yasha\\\\Documents\\\\NexStepAI\\\\ai-ml\\\\modules\\\\Courses.py',
    'C:/Users/yasha/Documents/NexStepAI/ai-ml/modules/Courses.py',
    '/C:/Users/yasha/Documents/NexStepAI/ai-ml/modules/Courses.py',
    path.resolve(__dirname, '../..', 'ai-ml/modules/Courses.py'),
    path.resolve(process.cwd(), 'ai-ml/modules/Courses.py')
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return p;
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
  const keys = Object.keys(data).filter(k => Array.isArray(data[k]) && data[k].length > 0);
  if (keys.length === 0) return null;
  return data;
}

function tokenize(text) {
  if (!text) return [];
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9+\-\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function inferCourseCategory(goalCategory, keywords = []) {
  const c = (goalCategory || '').toLowerCase();
  const kw = (keywords || []).map(k => String(k).toLowerCase());
  const hasAny = (arr) => kw.some(k => arr.some(a => k.includes(a) || a.includes(k)));

  if (c.includes('data') || c.includes('ml') || c.includes('machine')) return 'ds_course';
  if (c.includes('web') || c.includes('frontend') || c.includes('full stack')) return 'web_course';
  if (c.includes('android') || hasAny(['android', 'kotlin'])) return 'android_course';
  if (c.includes('ios') || c.includes('swift') || hasAny(['swift', 'ios'])) return 'ios_course';
  if (c.includes('ux') || c.includes('ui') || c.includes('design') || hasAny(['ux', 'ui', 'design'])) return 'uiux_course';
  if (hasAny(['react', 'node', 'django', 'flask'])) return 'web_course';
  if (hasAny(['tensorflow', 'data', 'machine'])) return 'ds_course';
  return null;
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
  return { score, matched, reasons };
}

function collectKeywordsFromRoadmap(roadmap, extra = []) {
  const stepKeywords = new Set();
  const addTokens = (val) => tokenize(val).forEach(t => stepKeywords.add(t));
  if (Array.isArray(roadmap?.steps)) {
    for (const s of roadmap.steps) {
      addTokens(s?.title);
      addTokens(s?.description);
      if (Array.isArray(s?.skills)) s.skills.forEach(addTokens);
    }
  }
  for (const item of (extra || [])) addTokens(item);
  if (Array.isArray(roadmap?.tags)) roadmap.tags.forEach(addTokens);
  if (Array.isArray(roadmap?.skillsRequired)) roadmap.skillsRequired.forEach(addTokens);
  if (Array.isArray(roadmap?.skillsLearned)) roadmap.skillsLearned.forEach(addTokens);
  return Array.from(stepKeywords);
}

async function getCourseRecommendations(roadmap, options = {}) {
  try {
    const coursesPath = resolveCoursesPyPath();
    if (!coursesPath) {
      return { success: false, suggestions: [], fallback: true, error: 'Courses.py not found' };
    }
    const content = fs.readFileSync(coursesPath, 'utf-8');
    const pyCourses = parseCoursesPy(content);
    if (!pyCourses) {
      return { success: false, suggestions: [], fallback: true, error: 'No valid course data in Courses.py' };
    }

    const keywords = collectKeywordsFromRoadmap(roadmap, [
      ...(options.goalTags || []),
      ...(options.goalSkills || [])
    ]);
    const categoryKey = inferCourseCategory(options.goalCategory || roadmap?.category, keywords);
    if (!categoryKey || !pyCourses[categoryKey] || pyCourses[categoryKey].length === 0) {
      return { success: true, suggestions: [], fallback: true, message: 'No matching category in Courses.py' };
    }

    const seen = new Set();
    const candidates = pyCourses[categoryKey].filter(c => {
      const key = (c.title || '').trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const scored = candidates.map(c => {
      const { score, matched, reasons } = computeRelevance(c.title, options.goalCategory || roadmap?.category, keywords);
      return {
        title: c.title,
        url: c.url,
        category: categoryKey,
        relevanceScore: score,
        relevanceReasons: reasons.length ? reasons : (options.goalCategory ? ['Goal category alignment'] : []),
        description: matched.length ? `Covers ${matched.join(', ')} topics relevant to your roadmap.` : 'Relevant course for your goal.',
        difficulty: roadmap?.difficulty || options.difficultyFilter || 'unknown'
      };
    });

    const minScore = typeof options.minScore === 'number' ? options.minScore : 0;
    const maxSuggestions = typeof options.maxSuggestions === 'number' ? options.maxSuggestions : 5;
    const filtered = scored.filter(s => s.relevanceScore >= minScore);
    filtered.sort((a, b) => b.relevanceScore - a.relevanceScore);
    const top = filtered.slice(0, maxSuggestions);

    return { success: true, suggestions: top, fallback: top.length === 0 };
  } catch (err) {
    return { success: false, suggestions: [], fallback: true, error: err.message };
  }
}

module.exports = {
  getCourseRecommendations,
  resolveCoursesPyPath, // exported for testing/debugging
  parseCoursesPy
};