from typing import List, Dict

def analyze_skill_gap(current_skills: List[str], target_skills: List[str]) -> Dict:
    current_lower = set([s.lower() for s in current_skills or []])
    target_lower = [t.lower() for t in target_skills or []]
    missing = [t for t in target_lower if t not in current_lower]
    matched = [t for t in target_lower if t in current_lower]
    return {
        'currentSkills': sorted(list(current_lower)),
        'targetSkills': target_lower,
        'matched': matched,
        'missing': missing,
        'gapSize': len(missing)
    }