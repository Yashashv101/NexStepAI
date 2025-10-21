from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
from modules.roadmap_generator import generate_roadmap
from modules.resume_parser import parse_resume
from modules.skill_gap_analyzer import analyze_skill_gap
from modules.recommendation_engine import get_recommendations

app = FastAPI(title="NexStepAI ML Service")

class RoadmapRequest(BaseModel):
    goal: str
    skill_level: str
    time_available: str
    current_skills: list = []

class ResumeRequest(BaseModel):
    resume_text: str

class SkillGapRequest(BaseModel):
    current_skills: list
    target_skills: list

@app.get("/")
def read_root():
    return {"message": "Welcome to NexStepAI ML Service"}

@app.post("/api/roadmap")
def create_roadmap(request: RoadmapRequest):
    try:
        roadmap = generate_roadmap(
            request.goal, 
            request.skill_level, 
            request.time_available,
            request.current_skills
        )
        return roadmap
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/parse-resume")
def process_resume(request: ResumeRequest):
    try:
        skills = parse_resume(request.resume_text)
        return {"skills": skills}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/skill-gap")
def process_skill_gap(request: SkillGapRequest):
    try:
        gap_analysis = analyze_skill_gap(request.current_skills, request.target_skills)
        return gap_analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/recommendations")
def get_learning_recommendations(request: SkillGapRequest):
    try:
        recommendations = get_recommendations(request.current_skills, request.target_skills)
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)