require('dotenv').config();

// AI Service Configuration
const aiConfig = {
    // Google Gemini Configuration
    gemini: {
        apiKey: process.env.GEMINI_API_KEY || '',
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
        temperature: 0.7,
        maxTokens: 2000,
        enabled: Boolean(process.env.GEMINI_API_KEY),
    },

    // Service Selection Strategy
    strategy: process.env.AI_STRATEGY || 'gemini', // 'gemini' only

    // Rate Limiting
    rateLimit: {
        maxRequestsPerUser: parseInt(process.env.AI_MAX_REQUESTS_PER_USER) || 10,
        windowMs: parseInt(process.env.AI_RATE_LIMIT_WINDOW) || 3600000, // 1 hour
    },

    // Retry Configuration
    retry: {
        maxAttempts: 3,
        delayMs: 1000,
    },

    // Timeout
    timeout: 30000, // 30 seconds
};

// Validation function
const validateAIConfig = () => {
    const errors = [];

    if (!aiConfig.gemini.enabled) {
        errors.push('Gemini API key must be configured');
    }

    if (aiConfig.gemini.enabled && !aiConfig.gemini.apiKey) {
        errors.push('GEMINI_API_KEY is required');
    }

    return errors;
};

// Get available services
const getAvailableServices = () => {
    const services = [];
    if (aiConfig.gemini.enabled) services.push('gemini');
    return services;
};

// Get service priority based on strategy
const getServicePriority = () => {
    return ['gemini']; // Only use Gemini
};

module.exports = {
    aiConfig,
    validateAIConfig,
    getAvailableServices,
    getServicePriority,
};

