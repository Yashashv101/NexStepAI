import os
import io
import re
import json
from typing import Dict, List, Any, Tuple

# Optional imports guarded to avoid hard failures in environments without these libs
try:
    import spacy
except Exception:
    spacy = None

try:
    from pdfminer.high_level import extract_text as pdf_extract_text
except Exception:
    pdf_extract_text = None

try:
    import docx  # python-docx
except Exception:
    docx = None


DEFAULT_SKILLS = [
    'python','java','javascript','typescript','react','node','django','flask','express','sql','mysql','postgres','mongodb',
    'aws','azure','gcp','docker','kubernetes','git','linux','html','css','tensorflow','pytorch','sklearn','nlp','cv',
    'swift','kotlin','android','ios','flutter','ui','ux','figma','photoshop','rest','graphql','ci','cd'
]

DEGREE_KEYWORDS = [
    'bachelor','master','phd','b.tech','m.tech','bsc','msc','bs','ms','be','me','mba','degree','diploma'
]


def _read_txt(path: str) -> str:
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        return f.read()


def _read_pdf(path: str) -> str:
    if pdf_extract_text is None:
        raise ImportError('pdfminer.six not available for PDF extraction')
    return pdf_extract_text(path) or ''


def _read_docx(path: str) -> str:
    if docx is None:
        raise ImportError('python-docx not available for DOCX extraction')
    doc = docx.Document(path)
    return '\n'.join([p.text for p in doc.paragraphs])


def extract_text_generic(source: Any) -> Tuple[str, str]:
    """Extract text from PDF, DOCX, or TXT.
    Returns (text, extension)
    """
    if isinstance(source, io.BytesIO):
        # Heuristic: use name attribute if present
        name = getattr(source, 'name', 'resume.txt')
        ext = os.path.splitext(name)[1].lower()
        tmp_path = os.path.join(os.getcwd(), f"_tmp_resume{ext or '.txt'}")
        with open(tmp_path, 'wb') as f:
            f.write(source.getvalue())
        text, _ = extract_text_generic(tmp_path)
        os.remove(tmp_path)
        return text, ext

    # If source is a path
    ext = os.path.splitext(source)[1].lower()
    if ext in ['.txt', '.md']:
        return _read_txt(source), ext
    if ext in ['.pdf']:
        return _read_pdf(source), ext
    if ext in ['.docx']:
        return _read_docx(source), ext
    # Fallback: treat as text
    try:
        return _read_txt(source), ext or '.txt'
    except Exception:
        return '', ext or ''


def _extract_email(text: str) -> str:
    m = re.search(r'[\w\.-]+@[\w\.-]+', text)
    return m.group(0) if m else ''


def _extract_phone(text: str) -> str:
    m = re.search(r'(?:\+\d{1,3}\s*)?(?:\(?\d{3}\)?[\s-]?)?\d{3}[\s-]?\d{4}', text)
    return m.group(0) if m else ''


def _extract_name(text: str) -> str:
    # Simple heuristic: first line words with capitalization
    first_line = text.strip().splitlines()[0] if text.strip() else ''
    first_line = re.sub(r'[^A-Za-z\s]', '', first_line)
    tokens = [t for t in first_line.split() if t and t[0].isupper()]
    return ' '.join(tokens[:3])


def _extract_skills(text: str, skills_vocab: List[str]) -> List[str]:
    lower = text.lower()
    found = set()
    for s in skills_vocab:
        if re.search(rf'\b{re.escape(s.lower())}\b', lower):
            found.add(s)
    # Optional NLP noun chunking if spaCy is available
    if spacy:
        try:
            nlp = spacy.load('en_core_web_sm')
            doc = nlp(text)
            for chunk in doc.noun_chunks:
                t = chunk.text.lower().strip()
                for s in skills_vocab:
                    if s.lower() in t:
                        found.add(s)
        except Exception:
            pass
    return sorted(found)


def _extract_degrees(text: str) -> List[str]:
    lower = text.lower()
    hits = []
    for d in DEGREE_KEYWORDS:
        if d in lower:
            hits.append(d)
    return sorted(list(set(hits)))


def _extract_experience_years(text: str) -> float:
    years = 0.0
    for m in re.finditer(r'(\d+(?:\.\d+)?)\s*(?:\+\s*)?years?', text.lower()):
        try:
            years = max(years, float(m.group(1)))
        except Exception:
            continue
    return years


def match_requirements(skills: List[str], requirements: List[str]) -> Dict[str, Any]:
    req_norm = [r.lower() for r in requirements]
    skills_norm = [s.lower() for s in skills]
    matched = [r for r in requirements if r.lower() in skills_norm]
    missing = [r for r in requirements if r.lower() not in skills_norm]
    return { 'matched': matched, 'missing': missing }


def parse_resume(source: Any, job_requirements: List[str] = None, skills_vocab: List[str] = None) -> Dict[str, Any]:
    """High-level parser that extracts key details and optionally matches job requirements."""
    skills_vocab = skills_vocab or DEFAULT_SKILLS
    text, ext = extract_text_generic(source)
    details = {
        'name': _extract_name(text),
        'email': _extract_email(text),
        'mobile_number': _extract_phone(text),
        'skills': _extract_skills(text, skills_vocab),
        'degrees': _extract_degrees(text),
        'experience_years': _extract_experience_years(text),
        'no_of_pages': None,
        'source_ext': ext,
    }
    if job_requirements:
        details['requirements_match'] = match_requirements(details['skills'], job_requirements)
    return details


# Backward-compatible class wrapper (kept minimal)
class ResumeParser:
    def __init__(self, resume):
        self.resume = resume
        self.details = parse_resume(resume)

    def get_extracted_data(self):
        return self.details


def resume_result_wrapper(resume):
    parser = ResumeParser(resume)
    return parser.get_extracted_data()


if __name__ == '__main__':
    # Simple manual test harness
    import sys
    path = sys.argv[1] if len(sys.argv) > 1 else None
    if not path:
        print(json.dumps({'error': 'provide path'}))
    else:
        print(json.dumps(parse_resume(path, ['python','react','sql']), indent=2))
