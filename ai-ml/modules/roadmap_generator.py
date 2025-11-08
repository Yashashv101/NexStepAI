from typing import List, Dict

def generate_roadmap(current_skills: List[str], target_skills: List[str]) -> Dict:
    current = set([s.lower() for s in current_skills or []])
    target = [t.lower() for t in target_skills or []]
    steps = []
    order = 1
    # Foundation step
    steps.append({
        'title': 'Foundation Refresh',
        'description': 'Review core concepts and fill basics before advanced topics.',
        'duration': '1-2 weeks',
        'skills': list(current)[:6],
        'order': order
    })
    order += 1
    # Create one step per missing skill grouped simply
    missing = [t for t in target if t not in current]
    for m in missing:
        steps.append({
            'title': f'Learn {m.title()}',
            'description': f'Acquire hands-on proficiency in {m} via projects and exercises.',
            'duration': '1 week',
            'skills': [m],
            'order': order
        })
        order += 1
    # Project consolidation
    steps.append({
        'title': 'Capstone Project',
        'description': 'Build a portfolio project demonstrating end-to-end application of learned skills.',
        'duration': '2-3 weeks',
        'skills': missing[:5],
        'order': order
    })
    return {
        'title': 'Personalized Learning Path',
        'description': 'A practical roadmap tailored to your current skills and goals.',
        'estimatedDuration': '6-10 weeks',
        'difficulty': 'beginner' if len(current) < 5 else 'intermediate',
        'steps': steps,
        'skillsRequired': target[:6],
        'skillsLearned': missing,
        'tags': ['roadmap','skill-gap','learning-path']
    }