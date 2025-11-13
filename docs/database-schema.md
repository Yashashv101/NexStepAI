# Database Schema Documentation

## Overview
This document outlines the database schema and data models used in the NexStepAI analytics system.

## Collections

### Users Collection
Stores user account information and metadata.

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String,        // Hashed
  role: String,           // 'user' | 'admin'
  status: String,         // 'active' | 'inactive' | 'suspended'
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date,
  preferences: {
    notifications: Boolean,
    theme: String,
    language: String
  }
}
```

**Indexes:**
- `email` (unique)
- `status`
- `role`
- `createdAt`

### Goals Collection
Stores learning goals and career objectives.

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String,        // 'Frontend Development', 'Backend Development', etc.
  difficulty: String,      // 'Beginner', 'Intermediate', 'Advanced'
  estimatedTime: Number,   // In hours
  skills: [String],        // Required skills
  prerequisites: [ObjectId], // References to other goals
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId     // Reference to User
}
```

**Indexes:**
- `category`
- `difficulty`
- `isActive`
- `createdAt`

### Roadmaps Collection
Stores learning roadmaps with structured steps.

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  goalId: ObjectId,       // Reference to Goal
  category: String,
  difficulty: String,
  estimatedDuration: String, // e.g., '6 weeks', '1-2 months'
  timeAvailabilityHoursPerWeek: Number, // Persisted user availability used for conversions
  steps: [{
    _id: ObjectId,
    title: String,
    description: String,
    order: Number,
    duration: String,      // e.g., '2 weeks', '1-3 months'
    resources: [ObjectId], // References to Resources
    skills: [String],
    completed: Boolean,
    completedAt: Date,
    // Derived fields for precision and validation
    weeklyHours: Number,        // Hours per week applied to this step
    estimatedHours: Number,     // Midpoint hours estimate for this step
    estimatedHoursMin: Number,  // Minimum hours based on duration range
    estimatedHoursMax: Number   // Maximum hours based on duration range
  }],
  tags: [String],
  isPublished: Boolean,
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId     // Reference to User
}
```

**Indexes:**
- `goalId`
- `category`
- `difficulty`
- `isPublished`
- `createdAt`

### Activities Collection
Tracks user activities and progress events.

```javascript
{
  _id: ObjectId,
  userId: ObjectId,       // Reference to User
  type: String,          // Activity type enum
  description: String,
  metadata: {
    goalId: ObjectId,     // Optional reference to Goal
    roadmapId: ObjectId,  // Optional reference to Roadmap
    stepId: ObjectId,     // Optional reference to Roadmap step
    resourceId: ObjectId, // Optional reference to Resource
    progress: Number,     // Progress percentage (0-100)
    timeSpent: Number,    // Time spent in minutes
    additionalData: Mixed // Flexible field for activity-specific data
  },
  isPublic: Boolean,      // Whether activity is visible to others
  createdAt: Date
}
```

**Activity Types:**
- `goal_created`
- `goal_completed`
- `roadmap_started`
- `roadmap_completed`
- `step_completed`
- `resource_accessed`
- `skill_acquired`
- `milestone_reached`

**Indexes:**
- `userId`
- `type`
- `createdAt`
- `isPublic`
- `metadata.goalId`
- `metadata.roadmapId`

### Resources Collection
Stores learning resources and materials.

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  type: String,          // 'article', 'video', 'course', 'book', 'tutorial'
  url: String,
  category: String,
  difficulty: String,
  estimatedTime: Number, // In minutes
  rating: {
    average: Number,     // Average rating (1-5)
    count: Number        // Number of ratings
  },
  tags: [String],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId   // Reference to User
}
```

**Indexes:**
- `type`
- `category`
- `difficulty`
- `isActive`
- `rating.average`
- `createdAt`

### UserProgress Collection
Tracks individual user progress on roadmaps and goals.

```javascript
{
  _id: ObjectId,
  userId: ObjectId,      // Reference to User
  roadmapId: ObjectId,   // Reference to Roadmap
  goalId: ObjectId,      // Reference to Goal
  status: String,        // 'not_started', 'in_progress', 'completed', 'paused'
  progress: Number,      // Overall progress percentage (0-100)
  startedAt: Date,
  completedAt: Date,
  lastAccessedAt: Date,
  stepProgress: [{
    stepId: ObjectId,
    status: String,      // 'not_started', 'in_progress', 'completed'
    progress: Number,    // Step progress percentage (0-100)
    timeSpent: Number,   // Time spent in minutes
    startedAt: Date,
    completedAt: Date
  }],
  totalTimeSpent: Number, // Total time spent in minutes
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `userId`
- `roadmapId`
- `goalId`
- `status`
- `progress`
- `lastAccessedAt`

## Analytics Queries

### User Growth Analytics
```javascript
// Monthly user growth
db.users.aggregate([
  {
    $group: {
      _id: {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" }
      },
      count: { $sum: 1 }
    }
  },
  { $sort: { "_id.year": 1, "_id.month": 1 } }
])
```

### Goal Completion by Category
```javascript
// Goal completion rates by category
db.goals.aggregate([
  {
    $lookup: {
      from: "userprogresses",
      localField: "_id",
      foreignField: "goalId",
      as: "progress"
    }
  },
  {
    $group: {
      _id: "$category",
      total: { $sum: 1 },
      completed: {
        $sum: {
          $cond: [
            { $in: ["completed", "$progress.status"] },
            1,
            0
          ]
        }
      }
    }
  }
])
```



### Average Completion Time
```javascript
// Average time to complete roadmaps
db.userprogresses.aggregate([
  {
    $match: { status: "completed" }
  },
  {
    $group: {
      _id: null,
      avgTime: {
        $avg: {
          $divide: [
            { $subtract: ["$completedAt", "$startedAt"] },
            1000 * 60 * 60 * 24 // Convert to days
          ]
        }
      }
    }
  }
])
```

## Performance Optimizations

### Indexing Strategy
1. **Compound Indexes:** Created for frequently queried field combinations
2. **Sparse Indexes:** Used for optional fields to save space
3. **TTL Indexes:** Implemented for temporary data like sessions

### Query Optimization
1. **Aggregation Pipelines:** Used for complex analytics queries
2. **Projection:** Only fetch required fields to reduce network overhead
3. **Limit and Skip:** Implement pagination for large result sets

### Caching Strategy
1. **Application-Level Caching:** Implemented for frequently accessed analytics data
2. **Query Result Caching:** Cache expensive aggregation results
3. **Cache Invalidation:** Smart invalidation based on data changes

## Data Integrity

### Referential Integrity
- Foreign key relationships maintained through application logic
- Cascade delete operations for dependent documents
- Validation rules for required relationships

### Data Validation
- Schema validation using Mongoose models
- Custom validators for business rules
- Input sanitization and validation middleware

### Backup and Recovery
- Regular automated backups
- Point-in-time recovery capabilities
- Data archival strategies for historical analytics