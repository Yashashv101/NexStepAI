# Analytics API Documentation

## Overview
The Analytics API provides comprehensive dashboard data and administrative statistics for the NexStepAI platform. All endpoints require authentication and admin role access.

## Base URL
```
/api/analytics
```

## Authentication
All analytics endpoints require:
- Valid JWT token in Authorization header: `Bearer <token>`
- Admin role permissions

## Endpoints

### GET /dashboard
Retrieves comprehensive analytics dashboard data including user metrics, goal completion statistics, and engagement scores.

**Authentication:** Required (Admin only)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 1247,
    "goalsCompleted": 89,
    "activeRoadmaps": 32,
    "userGrowth": [
      { "month": "Jan", "users": 850 },
      { "month": "Feb", "users": 920 },
      // ... more months
    ],
    "goalCompletionByCategory": [
      {
        "category": "Frontend Development",
        "completed": 25,
        "total": 40,
        "completionRate": 62.5
      }
      // ... more categories
    ],
    "averageCompletionTime": 28,
    "successRate": 57
  },
  "cached": false
}
```

**Caching:** 5 minutes TTL

### GET /admin-stats
Retrieves administrative statistics including user counts, content metrics, and recent activities.

**Authentication:** Required (Admin only)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 1247,
    "totalGoals": 89,
    "totalRoadmaps": 32,
    "recentActivities": [
      {
        "id": "activity_id",
        "userId": "user_id",
        "type": "goal_completed",
        "description": "Completed React Fundamentals",
        "createdAt": "2024-01-15T10:30:00Z"
      }
      // ... more activities
    ]
  },
  "cached": false
}
```

**Caching:** 3 minutes TTL

## Data Models

### User Growth Data
```javascript
{
  month: String,    // Month abbreviation (Jan, Feb, etc.)
  users: Number     // Total users for that month
}
```

### Goal Completion by Category
```javascript
{
  category: String,        // Goal category name
  completed: Number,       // Number of completed goals
  total: Number,          // Total goals in category
  completionRate: Number  // Percentage completion rate
}
```

### Recent Activity
```javascript
{
  id: String,           // Activity ID
  userId: String,       // User who performed the activity
  type: String,         // Activity type (goal_completed, roadmap_started, etc.)
  description: String,  // Human-readable description
  createdAt: Date      // When the activity occurred
}
```

## Caching Implementation

### Cache Strategy
- **Analytics Dashboard:** 5-minute TTL to balance data freshness with performance
- **Admin Stats:** 3-minute TTL for more frequent updates of administrative data
- **Cache Keys:** Generated using consistent patterns for easy invalidation

### Cache Utilities
The system uses a custom caching utility (`server/utils/cache.js`) that provides:
- TTL-based expiration
- Automatic cleanup of expired entries
- Key generation helpers
- Get-or-set pattern for efficient data retrieval

### Cache Key Patterns
```javascript
// Analytics dashboard cache key
analytics:dashboard

// Admin stats cache key  
analytics:admin_stats
```

## Error Responses

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
  "error": ["Access denied. Required role: admin. Your role: user"]
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

## Performance Considerations

1. **Caching:** All endpoints implement intelligent caching to reduce database load
2. **Aggregation:** Complex calculations are performed efficiently using MongoDB aggregation pipelines
3. **Parallel Processing:** Multiple database queries are executed in parallel using Promise.all()
4. **Error Handling:** Comprehensive error handling prevents system crashes and provides meaningful feedback

## Usage Examples

### Fetch Analytics Dashboard
```javascript
const response = await fetch('/api/analytics/dashboard', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
```

### Fetch Admin Statistics
```javascript
const response = await fetch('/api/analytics/admin-stats', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
```