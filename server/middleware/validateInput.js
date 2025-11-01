const validator = require('validator');
const mongoose = require('mongoose');

// Sanitize string input
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return validator.escape(str.trim());
};

// Validate MongoDB ObjectId
const validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Validate email
const validateEmail = (email) => {
  return validator.isEmail(email);
};

// Validate URL
const validateURL = (url) => {
  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true
  });
};

// Validate password strength
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
    errors: [
      ...(password.length < minLength ? [`Password must be at least ${minLength} characters long`] : []),
      ...(!hasUpperCase ? ['Password must contain at least one uppercase letter'] : []),
      ...(!hasLowerCase ? ['Password must contain at least one lowercase letter'] : []),
      ...(!hasNumbers ? ['Password must contain at least one number'] : []),
      ...(!hasSpecialChar ? ['Password must contain at least one special character'] : [])
    ]
  };
};

// General input validation middleware
const validateInput = (validationRules) => {
  return (req, res, next) => {
    const errors = [];
    
    for (const field in validationRules) {
      const rules = validationRules[field];
      const value = req.body[field];
      
      // Check required fields
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }
      
      // Skip validation if field is not required and not provided
      if (!rules.required && (value === undefined || value === null || value === '')) {
        continue;
      }
      
      // Type validation
      if (rules.type) {
        switch (rules.type) {
          case 'string':
            if (typeof value !== 'string') {
              errors.push(`${field} must be a string`);
            } else {
              // String length validation
              if (rules.minLength && value.length < rules.minLength) {
                errors.push(`${field} must be at least ${rules.minLength} characters long`);
              }
              if (rules.maxLength && value.length > rules.maxLength) {
                errors.push(`${field} must be no more than ${rules.maxLength} characters long`);
              }
              // Sanitize string
              req.body[field] = sanitizeString(value);
            }
            break;
            
          case 'number':
            if (typeof value !== 'number' && !validator.isNumeric(value.toString())) {
              errors.push(`${field} must be a number`);
            } else {
              const numValue = Number(value);
              if (rules.min !== undefined && numValue < rules.min) {
                errors.push(`${field} must be at least ${rules.min}`);
              }
              if (rules.max !== undefined && numValue > rules.max) {
                errors.push(`${field} must be no more than ${rules.max}`);
              }
              req.body[field] = numValue;
            }
            break;
            
          case 'email':
            if (!validateEmail(value)) {
              errors.push(`${field} must be a valid email address`);
            }
            break;
            
          case 'url':
            if (!validateURL(value)) {
              errors.push(`${field} must be a valid URL`);
            }
            break;
            
          case 'objectId':
            if (!validateObjectId(value)) {
              errors.push(`${field} must be a valid ObjectId`);
            }
            break;
            
          case 'array':
            if (!Array.isArray(value)) {
              errors.push(`${field} must be an array`);
            } else {
              if (rules.minItems && value.length < rules.minItems) {
                errors.push(`${field} must have at least ${rules.minItems} items`);
              }
              if (rules.maxItems && value.length > rules.maxItems) {
                errors.push(`${field} must have no more than ${rules.maxItems} items`);
              }
            }
            break;
            
          case 'boolean':
            if (typeof value !== 'boolean') {
              errors.push(`${field} must be a boolean`);
            }
            break;
        }
      }
      
      // Enum validation
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
      }
      
      // Custom validation
      if (rules.custom && typeof rules.custom === 'function') {
        const customResult = rules.custom(value);
        if (customResult !== true) {
          errors.push(customResult || `${field} is invalid`);
        }
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }
    
    next();
  };
};

// Specific validation schemas
const validationSchemas = {
  // User registration validation
  userRegistration: {
    name: {
      required: true,
      type: 'string',
      minLength: 2,
      maxLength: 50
    },
    email: {
      required: true,
      type: 'email'
    },
    password: {
      required: true,
      type: 'string',
      custom: (value) => {
        const result = validatePassword(value);
        return result.isValid ? true : result.errors.join(', ');
      }
    }
  },
  
  // Goal creation validation
  goalCreation: {
    name: {
      required: true,
      type: 'string',
      minLength: 3,
      maxLength: 100
    },
    description: {
      required: true,
      type: 'string',
      minLength: 10,
      maxLength: 500
    },
    category: {
      required: true,
      type: 'string',
      enum: ['Technology', 'Business', 'Creative', 'Health', 'Education', 'Personal Development']
    },
    difficulty: {
      required: true,
      type: 'string',
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
    },
    estimatedTime: {
      required: false,
      type: 'number',
      min: 1,
      max: 10000
    }
  },
  
  // Resource creation validation
  resourceCreation: {
    title: {
      required: true,
      type: 'string',
      minLength: 3,
      maxLength: 200
    },
    description: {
      required: true,
      type: 'string',
      minLength: 10,
      maxLength: 1000
    },
    type: {
      required: true,
      type: 'string',
      enum: ['article', 'video', 'course', 'book', 'tutorial', 'documentation', 'tool', 'practice']
    },
    url: {
      required: false,
      type: 'url'
    },
    difficulty: {
      required: true,
      type: 'string',
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
    },
    estimatedTime: {
      required: false,
      type: 'number',
      min: 1,
      max: 10000
    }
  },
  
  // Roadmap creation validation
  roadmapCreation: {
    title: {
      required: true,
      type: 'string',
      minLength: 3,
      maxLength: 200
    },
    description: {
      required: true,
      type: 'string',
      minLength: 10,
      maxLength: 1000
    },
    goalId: {
      required: true,
      type: 'objectId'
    },
    difficulty: {
      required: true,
      type: 'string',
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
    },
    estimatedDuration: {
      required: false,
      type: 'number',
      min: 1,
      max: 10000
    }
  }
};

module.exports = {
  validateInput,
  validationSchemas,
  validateObjectId,
  validateEmail,
  validateURL,
  validatePassword,
  sanitizeString
};