# AI-Driven Roadmap Generation System - Complete Guide

## Overview

This guide provides comprehensive documentation for the AI-driven roadmap generation system implemented in NexStepAI. The system allows users to submit their learning goals and automatically generates personalized learning roadmaps using Google Gemini AI.

## Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Setup Instructions](#setup-instructions)
4. [API Documentation](#api-documentation)
5. [Frontend Components](#frontend-components)
6. [Admin Moderation](#admin-moderation)
7. [Configuration Options](#configuration-options)
8. [Security & Rate Limiting](#security--rate-limiting)

---

## Features

### User Features
- **Goal Submission**: Users can describe their learning goals in natural language
- **AI Enhancement**: Goals are automatically enhanced and categorized by AI
- **Roadmap Generation**: Personalized learning roadmaps with detailed steps
- **Service Selection**: Google Gemini AI service for optimal performance
- **Rate Limiting**: Fair usage with 10 roadmaps per hour per user
- **Preview & Edit**: Review AI-generated content before saving
- **Existing Goals**: Choose from existing goals or create new ones

### Admin Features
- **Content Moderation**: Review and approve/reject user-generated content
- **AI Analytics**: Track AI usage and generation statistics
- **Filter & Search**: Filter by generation type (AI/Manual) and moderation status
- **Audit Trail**: Complete history of AI-generated content

---

## Architecture

### Backend Structure

```
server/
├── config/
│   └── aiConfig.js           # AI service configuration
├── services/
│   └── aiService.js          # AI integration layer
├── controllers/
│   └── aiRoadmapController.js # AI roadmap endpoints
├── routes/
│   └── aiRoadmapRoutes.js    # API routes
└── models/
    ├── Goal.js               # Extended with AI tracking
    └── Roadmap.js            # Extended with AI metadata
```

### Frontend Structure

```
client/src/
├── pages/user/
│   └── AIRoadmapGenerator.jsx # Main AI generation UI
├── pages/admin/
│   ├── ManageGoals.jsx        # Updated with AI filters
│   └── ManageRoadmaps.jsx     # Updated with AI filters
└── services/
    └── api.js                 # AI API integration
```

### Data Flow

```
User Input → AI Enhancement → Goal Creation → Roadmap Generation → Preview → Save
     ↓              ↓               ↓                  ↓              ↓        ↓
  Natural      Structured      Database         AI Service      User     Database
  Language       Goal                            (Gemini)       Review
```

---

## Setup Instructions

### 1. Install Dependencies

```bash
# Backend dependencies
cd server
npm install @google/generative-ai axios

# Frontend dependencies are already installed
```

### 2. Configure Environment Variables

Create a `.env` file in the `server/` directory:

```env
# AI Services
GEMINI_API_KEY=your-gemini-key-here

# AI Configuration (optional)
GEMINI_MODEL=gemini-1.5-flash
AI_STRATEGY=gemini
AI_MAX_REQUESTS_PER_USER=10
AI_RATE_LIMIT_WINDOW=3600000
```

### 3. Obtain API Key

#### Google Gemini
1. Visit https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Create API key
4. Copy the key to your `.env` file

### 4. Start the Servers

```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
cd client
npm run dev
```

### 5. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- AI Roadmap Generator: http://localhost:5173/user/ai-roadmap

---

## API Documentation

### User Endpoints

#### 1. Enhance User Goal
```http
POST /api/ai/enhance-goal
Authorization: Bearer {token}
Content-Type: application/json

{
  "goalText": "I want to become a full-stack web developer"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "suggestedName": "Full-Stack Web Developer",
    "category": "Full Stack Development",
    "difficulty": "intermediate",
    "estimatedTime": "6-12 months",
    "description": "Comprehensive path to becoming a full-stack developer...",
    "tags": ["javascript", "react", "nodejs"],
    "skillsRequired": ["HTML", "CSS", "JavaScript"],
    "skillsLearned": ["React", "Node.js", "MongoDB"]
  },
  "aiService": "gemini",
  "rateLimit": {
    "remaining": 9,
    "resetAt": 1699123456789
  }
}
```

#### 2. Create User Goal
```http
POST /api/ai/create-user-goal
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Full-Stack Web Developer",
  "description": "Learn full-stack development...",
  "category": "Full Stack Development",
  "difficulty": "intermediate",
  "estimatedTime": "6-12 months",
  "tags": ["javascript", "react"],
  "skillsRequired": ["HTML", "CSS"],
  "skillsLearned": ["React", "Node.js"],
  "originalGoalText": "I want to become a full-stack developer",
  "isAIEnhanced": true
}
```

#### 3. Generate AI Roadmap
```http
POST /api/ai/generate-roadmap
Authorization: Bearer {token}
Content-Type: application/json

{
  "goalId": "67890abcdef1234567890abc",
  "userContext": {
    "skillLevel": "beginner",
    "background": "Computer Science student",
    "timeAvailability": "10 hours/week"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "roadmap": {
      "title": "Full-Stack Web Development Mastery",
      "description": "Comprehensive learning path...",
      "estimatedDuration": "6-9 months",
      "difficulty": "intermediate",
      "steps": [
        {
          "title": "HTML & CSS Fundamentals",
          "description": "Master the basics...",
          "duration": "3 weeks",
          "skills": ["HTML5", "CSS3", "Responsive Design"],
          "order": 1
        }
      ],
      "skillsRequired": ["Basic programming"],
      "skillsLearned": ["React", "Node.js", "MongoDB"],
      "tags": ["web-development", "full-stack"]
    },
    "goalId": "67890abcdef1234567890abc",
    "goalName": "Full-Stack Web Developer"
  },
  "aiService": "gemini",
  "aiModel": "gemini-1.5-flash"
}
```

#### 4. Save AI Roadmap
```http
POST /api/ai/save-roadmap
Authorization: Bearer {token}
Content-Type: application/json

{
  "goalId": "67890abcdef1234567890abc",
  "roadmapData": {
    "title": "Full-Stack Web Development Mastery",
    "description": "...",
    "estimatedDuration": "6-9 months",
    "difficulty": "intermediate",
    "steps": [...]
  },
  "aiService": "gemini",
  "aiModel": "gemini-1.5-flash"
}
```

#### 5. Get User AI Stats
```http
GET /api/ai/user-stats
Authorization: Bearer {token}
```

### Admin Endpoints

#### 1. Get All AI Roadmaps
```http
GET /api/ai/admin/roadmaps?moderationStatus=pending&page=1&limit=20
Authorization: Bearer {admin-token}
```

#### 2. Get All User Goals
```http
GET /api/ai/admin/user-goals?moderationStatus=all&page=1&limit=20
Authorization: Bearer {admin-token}
```

#### 3. Moderate Roadmap
```http
PUT /api/ai/admin/moderate-roadmap/{roadmapId}
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "moderationStatus": "approved",
  "moderationNotes": "Excellent roadmap structure"
}
```

#### 4. Moderate Goal
```http
PUT /api/ai/admin/moderate-goal/{goalId}
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "moderationStatus": "approved",
  "moderationNotes": "Well-defined goal"
}
```

---

## Frontend Components

### AIRoadmapGenerator Component

**Location**: `client/src/pages/user/AIRoadmapGenerator.jsx`

**Features**:
- Multi-step wizard interface
- Goal input or selection
- Real-time AI generation
- Roadmap preview
- User context customization

**Usage**:
```jsx
import AIRoadmapGenerator from './pages/user/AIRoadmapGenerator';

// In your routes
<Route path="/user/ai-roadmap" element={<AIRoadmapGenerator />} />
```

### Updated Admin Components

**ManageGoals.jsx** - Enhanced with:
- Filter by source (Admin/User)
- Filter by moderation status
- Visual indicators for AI-enhanced goals
- Moderation status badges

**ManageRoadmaps.jsx** - Enhanced with:
- Filter by generation type (Manual/AI)
- AI service indicators
- Moderation status display

---

## Admin Moderation

### Moderation Workflow

1. **User Submits Goal**: Status = 'approved' (auto-approved by default)
2. **Admin Reviews**: Can change to 'pending', 'rejected', or 'flagged'
3. **AI Generates Roadmap**: Status = 'approved'
4. **Admin Monitors**: Filter and review AI-generated content

### Moderation Statuses

- **approved**: Content is public and accessible
- **pending**: Awaiting review (optional workflow)
- **rejected**: Content is hidden but not deleted
- **flagged**: Marked for attention

### Changing Auto-Approval

To require admin approval before goals/roadmaps are public:

In `server/controllers/aiRoadmapController.js`:
```javascript
// Change this:
moderationStatus: 'approved'

// To this:
moderationStatus: 'pending'
```

---

## Configuration Options

### AI Strategy

Control which AI service is used:

```env
AI_STRATEGY=gemini    # Always use Gemini
```

### Rate Limiting

```env
# Maximum roadmaps per user per time window
AI_MAX_REQUESTS_PER_USER=10

# Time window in milliseconds (default: 1 hour)
AI_RATE_LIMIT_WINDOW=3600000
```

### Model Selection

```env
# Gemini models
GEMINI_MODEL=gemini-1.5-flash   # Fast and efficient
GEMINI_MODEL=gemini-1.5-pro     # Higher quality
```

---

## Security & Rate Limiting

### Implementation

The system includes built-in rate limiting:

```javascript
// In-memory rate limiting (10 requests per hour per user)
const rateLimitCheck = checkRateLimit(req.user.id, 10, 3600000);

if (!rateLimitCheck.allowed) {
  return res.status(429).json({
    message: `Rate limit exceeded. Try again in ${retryAfter} seconds`
  });
}
```

### Production Recommendations

For production environments:

1. **Use Redis for Rate Limiting**
```javascript
const redis = require('redis');
const client = redis.createClient();
```

2. **Implement API Key Rotation**
3. **Monitor AI Costs**
4. **Set Budget Alerts**
5. **Implement Request Queuing**

### Cost Management

**Gemini Pricing**:
- Gemini 1.5 Flash: Free tier available
- 15 requests per minute

**Estimated Costs**:
- Using Gemini free tier: $0

---

## Troubleshooting

### Common Issues

1.2. **"AI service not configured"**
   - Ensure Gemini API key is set in `.env`
   - Restart the server after adding key

2. **"Rate limit exceeded"**
   - Wait for the rate limit window to reset (1 hour by default)
   - Increase limits in `.env` if needed

3. **"Failed to parse AI response"**
   - AI sometimes returns invalid JSON
   - System will handle parsing errors gracefully
   - Check server logs for details

4. **Slow generation times**
   - Use Gemini for faster responses
   - Check network connectivity
   - Verify API quotas aren't exceeded

### Debug Mode

Enable detailed logging:

```javascript
// In server/services/aiService.js
console.log('AI Request:', prompt);
console.log('AI Response:', response);
```

---

## Future Enhancements

1. **Streaming Responses**: Show roadmap generation in real-time
2. **Roadmap Refinement**: Allow users to iteratively improve roadmaps
3. **Multi-language Support**: Generate roadmaps in different languages
4. **Resource Suggestions**: AI-powered resource recommendations
5. **Progress Tracking**: AI-generated milestones and checkpoints
6. **Collaborative Filtering**: Learn from user feedback
7. **Custom Templates**: Save and reuse roadmap templates

---

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review server logs in `server/logs/`
3. Verify API keys are valid
4. Check rate limits haven't been exceeded

---

## License

This implementation is part of NexStepAI and follows the project's license.

