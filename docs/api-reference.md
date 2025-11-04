# API Reference

## Authentication

### POST /api/auth/register
Register a new user.

### POST /api/auth/login
Login and get authentication token.

### POST /api/auth/register-admin
Register a new admin user.

### GET /api/auth/me
Get current user profile information.

### PUT /api/auth/me
Update current user profile.

## Roadmaps

### GET /api/roadmaps
Get all roadmaps for the authenticated user.

### GET /api/roadmaps/:id
Get a specific roadmap by ID.

### POST /api/roadmaps
Create a new roadmap (Admin only).

### PUT /api/roadmaps/:id
Update a roadmap (Admin only).

### DELETE /api/roadmaps/:id
Delete a roadmap (Admin only).

### GET /api/roadmaps/user/:userId
Get roadmaps for a specific user.

### PUT /api/roadmaps/:id/step/:stepId/complete
Mark a roadmap step as complete.

## Goals

### GET /api/goals
Get all available goals.

### POST /api/goals
Create a new goal (Admin only).

## Progress

### GET /api/progress
Get all user progress data.

### GET /api/progress/stats
Get user progress statistics.

### GET /api/progress/:roadmapId
Get progress for a specific roadmap.

### POST /api/progress/:roadmapId/start
Start a roadmap.

### PUT /api/progress/:roadmapId/step/:stepId
Update progress for a specific step.

### PUT /api/progress/:roadmapId/reset
Reset progress for a roadmap.

## Activities

### GET /api/activities
Get user activities.

### GET /api/activities/public
Get public activities.

### GET /api/activities/summary
Get activity summary.

### GET /api/activities/types
Get available activity types.

### POST /api/activities
Create a new activity.

### PUT /api/activities/:id/visibility
Update activity visibility.

### DELETE /api/activities/:id
Delete an activity.

## Analytics (Admin Only)

### GET /api/analytics/dashboard
Get comprehensive analytics dashboard data including user metrics, goal completion statistics, and engagement scores.

**Authentication:** Admin role required
**Caching:** 5 minutes TTL

### GET /api/analytics/admin-stats
Get administrative statistics including user counts, content metrics, and recent activities.

**Authentication:** Admin role required
**Caching:** 3 minutes TTL

## Users (Admin Only)

### GET /api/users
Get all users.

### GET /api/users/stats
Get user statistics.

### GET /api/users/:id
Get a specific user.

### PUT /api/users/:id
Update a user.

### DELETE /api/users/:id
Delete a user.

## Resources

### GET /api/resources
Get learning resources.

### GET /api/resources/types
Get resource types.

### GET /api/resources/popular
Get popular resources.

### GET /api/resources/:id
Get a specific resource by ID.

### POST /api/resources
Create a new resource.

### PUT /api/resources/:id
Update a resource.

### DELETE /api/resources/:id
Delete a resource.

### PUT /api/resources/:id/rate
Rate a resource.

## Resume (Under Development)

### POST /api/resumes/upload
Upload and parse a resume.

### GET /api/resumes
Get all resumes for the authenticated user.

## Skill Gap (Under Development)

### POST /api/skillgaps/analyze
Analyze skill gap based on current skills and target role.

### GET /api/skillgaps
Get all skill gap analyses for the authenticated user.

## Error Responses

All endpoints return standardized error responses:

### 400 Bad Request
```json
{
  "success": false,
  "error": ["Validation error message"]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": ["Not authorized, no token"]
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": ["Access denied. Required role: admin"]
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": ["Resource not found"]
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Server Error",
  "error": "Detailed error message"
}
```

## Rate Limiting

- Registration: 5 requests per 15 minutes per IP
- Admin Registration: 3 requests per hour per IP  
- Login: 10 requests per 15 minutes per IP

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

Admin-only endpoints additionally require the user to have admin role permissions.