from typing import List, Dict
try:
    from .Courses import ds_course, web_course, android_course, ios_course, uiux_course
except Exception:
    # Fallback empty lists if Courses module is unavailable
    ds_course, web_course, android_course, ios_course, uiux_course = [], [], [], [], []


CATEGORY_MAP = {
    'data science': ds_course,
    'ml': ds_course,
    'machine learning': ds_course,
    'web': web_course,
    'frontend': web_course,
    'backend': web_course,
    'react': web_course,
    'android': android_course,
    'kotlin': android_course,
    'flutter': android_course,
    'ios': ios_course,
    'swift': ios_course,
    'ui': uiux_course,
    'ux': uiux_course,
    'figma': uiux_course,
}


def infer_categories(skills: List[str]) -> List[str]:
    s = ' '.join(skills).lower()
    cats = set()
    for key in CATEGORY_MAP.keys():
        if key in s:
            cats.add(key)
    # Basic heuristics
    if 'tensorflow' in s or 'pytorch' in s or 'sklearn' in s:
        cats.add('machine learning')
    if 'react' in s or 'node' in s or 'django' in s or 'flask' in s:
        cats.add('web')
    return list(cats)


def get_recommendations(current_skills: List[str], target_skills: List[str]) -> Dict:
    missing = [t for t in (target_skills or []) if t.lower() not in [c.lower() for c in current_skills or []]]
    cats = infer_categories(current_skills + missing)
    courses = []
    for c in cats:
        courses.extend(CATEGORY_MAP.get(c, []))
    # Deduplicate preserving order
    seen = set()
    unique_courses = []
    for title, link in courses:
        if title not in seen:
            unique_courses.append({'title': title, 'link': link})
            seen.add(title)
    return {
        'categories': cats,
        'missingSkills': missing,
        'courses': unique_courses[:10]
    }