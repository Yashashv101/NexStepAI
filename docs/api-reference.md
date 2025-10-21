# API Reference

## Authentication

### POST /api/auth/register
Register a new user.

### POST /api/auth/login
Login and get authentication token.

## Roadmaps

### GET /api/roadmaps
Get all roadmaps for the authenticated user.

### GET /api/roadmaps/:id
Get a specific roadmap by ID.

### POST /api/roadmaps
Create a new roadmap.

## Resume

### POST /api/resumes/upload
Upload and parse a resume.

### GET /api/resumes
Get all resumes for the authenticated user.

## Skill Gap

### POST /api/skillgaps/analyze
Analyze skill gap based on current skills and target role.

### GET /api/skillgaps
Get all skill gap analyses for the authenticated user.

## Resources

### GET /api/resources
Get learning resources based on skill gap.

### GET /api/resources/:id
Get a specific resource by ID.