// Course datasets mirrored from Python Courses.py
const ds_course = [
  ['Machine Learning Crash Course by Google [Free]', 'https://developers.google.com/machine-learning/crash-course'],
  ['Machine Learning A-Z by Udemy','https://www.udemy.com/course/machinelearning/'],
  ['Machine Learning by Andrew NG','https://www.coursera.org/learn/machine-learning'],
  ['Data Scientist Master Program of Simplilearn (IBM)','https://www.simplilearn.com/big-data-and-analytics/senior-data-scientist-masters-program-training'],
  ['Data Science Foundations: Fundamentals by LinkedIn','https://www.linkedin.com/learning/data-science-foundations-fundamentals-5'],
  ['Data Scientist with Python','https://www.datacamp.com/tracks/data-scientist-with-python'],
  ['Programming for Data Science with Python','https://www.udacity.com/course/programming-for-data-science-nanodegree--nd104'],
  ['Programming for Data Science with R','https://www.udacity.com/course/programming-for-data-science-nanodegree-with-R--nd118'],
  ['Introduction to Data Science','https://www.udacity.com/course/introduction-to-data-science--cd0017'],
  ['Intro to Machine Learning with TensorFlow','https://www.udacity.com/course/intro-to-machine-learning-with-tensorflow-nanodegree--nd230']
];

const web_course = [
  ['Django Crash course [Free]','https://youtu.be/e1IyzVyrLSU'],
  ['Python and Django Full Stack Web Developer Bootcamp','https://www.udemy.com/course/python-and-django-full-stack-web-developer-bootcamp'],
  ['React Crash Course [Free]','https://youtu.be/Dorf8i6lCuk'],
  ['ReactJS Project Development Training','https://www.dotnettricks.com/training/masters-program/reactjs-certification-training'],
  ['Full Stack Web Developer - MEAN Stack','https://www.simplilearn.com/full-stack-web-developer-mean-stack-certification-training'],
  ['Node.js and Express.js [Free]','https://youtu.be/Oe421EPjeBE'],
  ['Flask: Develop Web Applications in Python','https://www.educative.io/courses/flask-develop-web-applications-in-python'],
  ['Full Stack Web Developer by Udacity','https://www.udacity.com/course/full-stack-web-developer-nanodegree--nd0044'],
  ['Front End Web Developer by Udacity','https://www.udacity.com/course/front-end-web-developer-nanodegree--nd0011'],
  ['Become a React Developer by Udacity','https://www.udacity.com/course/react-nanodegree--nd019']
];

const android_course = [
  ['Android Development for Beginners [Free]','https://youtu.be/fis26HvvDII'],
  ['Android App Development Specialization','https://www.coursera.org/specializations/android-app-development'],
  ['Associate Android Developer Certification','https://grow.google/androiddev/#?modal_active=none'],
  ['Become an Android Kotlin Developer by Udacity','https://www.udacity.com/course/android-kotlin-developer-nanodegree--nd940'],
  ['Android Basics by Google','https://www.udacity.com/course/android-basics-nanodegree-by-google--nd803'],
  ['The Complete Android Developer Course','https://www.udemy.com/course/complete-android-n-developer-course/'],
  ['Building an Android App with Architecture Components','https://www.linkedin.com/learning/building-an-android-app-with-architecture-components'],
  ['Android App Development Masterclass using Kotlin','https://www.udemy.com/course/android-oreo-kotlin-app-masterclass/'],
  ['Flutter & Dart - The Complete Flutter App Development Course','https://www.udemy.com/course/flutter-dart-the-complete-flutter-app-development-course/'],
  ['Flutter App Development Course [Free]','https://youtu.be/rZLR5olMR64']
];

const ios_course = [
  ['IOS App Development by LinkedIn','https://www.linkedin.com/learning/subscription/topics/ios'],
  ['iOS & Swift - The Complete iOS App Development Bootcamp','https://www.udemy.com/course/ios-13-app-development-bootcamp/'],
  ['Become an iOS Developer','https://www.udacity.com/course/ios-developer-nanodegree--nd003'],
  ['iOS App Development with Swift Specialization','https://www.coursera.org/specializations/app-development'],
  ['Mobile App Development with Swift','https://www.edx.org/professional-certificate/curtinx-mobile-app-development-with-swift'],
  ['Swift Course by LinkedIn','https://www.linkedin.com/learning/subscription/topics/swift-2'],
  ['Objective-C Crash Course for Swift Developers','https://www.udemy.com/course/objectivec/'],
  ['Learn Swift by Codecademy','https://www.codecademy.com/learn/learn-swift'],
  ['Swift Tutorial - Full Course for Beginners [Free]','https://youtu.be/comQ1-x2a1Q'],
  ['Learn Swift Fast - [Free]','https://youtu.be/FcsY1YPBwzQ']
];

const uiux_course = [
  ['Google UX Design Professional Certificate','https://www.coursera.org/professional-certificates/google-ux-design'],
  ['UI / UX Design Specialization','https://www.coursera.org/specializations/ui-ux-design'],
  ['The Complete App Design Course - UX, UI and Design Thinking','https://www.udemy.com/course/the-complete-app-design-course-ux-and-ui-design/'],
  ['UX & Web Design Master Course: Strategy, Design, Development','https://www.udemy.com/course/ux-web-design-master-course-strategy-design-development/'],
  ['The Complete App Design Course - UX, UI and Design Thinking','https://www.udemy.com/course/the-complete-app-design-course-ux-and-ui-design/'],
  ['DESIGN RULES: Principles + Practices for Great UI Design','https://www.udemy.com/course/design-rules/'],
  ['Become a UX Designer by Udacity','https://www.udacity.com/course/ux-designer-nanodegree--nd578'],
  ['Adobe XD Tutorial: User Experience Design Course [Free]','https://youtu.be/68w2VwalD5w'],
  ['Adobe XD for Beginners [Free]','https://youtu.be/WEljsc2jorI'],
  ['Adobe XD in Simple Way','https://learnux.io/course/adobe-xd']
];

const CATEGORY_MAP = {
  'machine learning': ds_course,
  'data science': ds_course,
  'web': web_course,
  'react': web_course,
  'frontend': web_course,
  'backend': web_course,
  'android': android_course,
  'kotlin': android_course,
  'flutter': android_course,
  'ios': ios_course,
  'swift': ios_course,
  'ui': uiux_course,
  'ux': uiux_course,
  'figma': uiux_course,
};

function inferCategories(skills) {
  const s = (skills || []).join(' ').toLowerCase();
  const cats = new Set();
  for (const key of Object.keys(CATEGORY_MAP)) {
    if (s.includes(key)) cats.add(key);
  }
  if (s.includes('tensorflow') || s.includes('pytorch') || s.includes('sklearn')) {
    cats.add('machine learning');
  }
  if (s.includes('react') || s.includes('node') || s.includes('django') || s.includes('flask')) {
    cats.add('web');
  }
  return Array.from(cats);
}

function recommendCourses(currentSkills = [], targetSkills = []) {
  const missing = (targetSkills || []).filter(t => !currentSkills.map(s => s.toLowerCase()).includes(t.toLowerCase()));
  const cats = inferCategories([...currentSkills, ...missing]);
  const courses = [];
  cats.forEach(c => {
    (CATEGORY_MAP[c] || []).forEach(([title, link]) => courses.push({ title, link }));
  });
  const seen = new Set();
  const uniqueCourses = courses.filter(c => {
    if (seen.has(c.title)) return false;
    seen.add(c.title);
    return true;
  });
  return {
    categories: cats,
    missingSkills: missing,
    courses: uniqueCourses.slice(0, 10)
  };
}

// Compute a simple relevance score based on missing skills appearing in course titles
function computeCourseRelevance(title = '', missingSkills = [], positionTitle = '') {
  const t = title.toLowerCase();
  const pos = (positionTitle || '').toLowerCase();
  const keywords = new Set();
  missingSkills.forEach(ms => keywords.add(ms.toLowerCase()));
  if (pos.includes('frontend')) { keywords.add('react'); keywords.add('frontend'); }
  if (pos.includes('backend')) { keywords.add('node'); keywords.add('backend'); }
  if (pos.includes('android')) { keywords.add('android'); keywords.add('kotlin'); keywords.add('flutter'); }
  if (pos.includes('ios')) { keywords.add('ios'); keywords.add('swift'); }
  if (pos.includes('machine') || pos.includes('data')) { keywords.add('machine'); keywords.add('learning'); keywords.add('data'); keywords.add('tensorflow'); keywords.add('pytorch'); }

  let hits = 0;
  keywords.forEach(k => { if (t.includes(k)) hits++; });
  const base = Math.max(1, keywords.size);
  return hits / base; // 0.0 - 1.0
}

/**
 * Position-aware course recommendations.
 * Filters and scores courses based on missing skills and target position.
 * Returns courses with confidence indicators and categories used.
 */
function recommendCoursesForPosition(currentSkills = [], targetSkills = [], positionTitle = '') {
  const missing = (targetSkills || []).filter(t => !currentSkills.map(s => s.toLowerCase()).includes(t.toLowerCase()));
  const cats = inferCategories([...currentSkills, ...missing, positionTitle]);
  const pool = [];
  cats.forEach(c => {
    (CATEGORY_MAP[c] || []).forEach(([title, link]) => pool.push({ title, link }));
  });

  const scored = pool.map(c => {
    const relevance = computeCourseRelevance(c.title, missing, positionTitle);
    return { ...c, relevance };
  });

  // Sort by relevance desc and apply threshold for higher quality
  const top = scored
    .filter(c => c.relevance >= 0.6) // threshold tuned; aims for high relevance
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 10)
    .map(c => ({ title: c.title, link: c.link, confidence: Number(c.relevance.toFixed(2)) }));

  const seen = new Set();
  const uniqueTop = top.filter(c => { if (seen.has(c.title)) return false; seen.add(c.title); return true; });

  return {
    categories: cats,
    missingSkills: missing,
    courses: uniqueTop,
  };
}

module.exports = {
  recommendCourses,
  recommendCoursesForPosition,
};