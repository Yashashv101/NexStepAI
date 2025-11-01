const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  SECURITY: 'SECURITY',
  AUDIT: 'AUDIT'
};

// Format timestamp
const formatTimestamp = () => {
  return new Date().toISOString();
};

// Format log entry
const formatLogEntry = (level, message, metadata = {}) => {
  return JSON.stringify({
    timestamp: formatTimestamp(),
    level,
    message,
    ...metadata
  }) + '\n';
};

// Write to log file
const writeToLogFile = (filename, entry) => {
  const logPath = path.join(logsDir, filename);
  fs.appendFileSync(logPath, entry);
};

// General logger
const log = (level, message, metadata = {}) => {
  const entry = formatLogEntry(level, message, metadata);
  
  // Write to general log
  writeToLogFile('app.log', entry);
  
  // Also log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[${level}] ${message}`, metadata);
  }
};

// Security-specific logger
const logSecurity = (event, details = {}) => {
  const entry = formatLogEntry(LOG_LEVELS.SECURITY, event, {
    ...details,
    ip: details.ip || 'unknown',
    userAgent: details.userAgent || 'unknown'
  });
  
  // Write to security log
  writeToLogFile('security.log', entry);
  
  // Also write to general log
  writeToLogFile('app.log', entry);
  
  // Console log in development
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[SECURITY] ${event}`, details);
  }
};

// Audit-specific logger for admin operations
const logAudit = (action, details = {}) => {
  const entry = formatLogEntry(LOG_LEVELS.AUDIT, action, {
    ...details,
    timestamp: formatTimestamp()
  });
  
  // Write to audit log
  writeToLogFile('audit.log', entry);
  
  // Also write to general log
  writeToLogFile('app.log', entry);
  
  // Console log in development
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[AUDIT] ${action}`, details);
  }
};

// Specific logging functions for common events
const logAdminCreation = (adminData, createdBy = 'system') => {
  logAudit('ADMIN_USER_CREATED', {
    adminId: adminData.id,
    adminEmail: adminData.email,
    createdBy,
    ip: adminData.ip,
    userAgent: adminData.userAgent
  });
};

const logAdminLogin = (adminData, ip, userAgent) => {
  logSecurity('ADMIN_LOGIN_SUCCESS', {
    adminId: adminData.id,
    adminEmail: adminData.email,
    ip,
    userAgent
  });
};

const logFailedAdminLogin = (email, ip, userAgent, reason = 'invalid_credentials') => {
  logSecurity('ADMIN_LOGIN_FAILED', {
    email,
    reason,
    ip,
    userAgent
  });
};

const logRateLimitExceeded = (endpoint, ip, userAgent) => {
  logSecurity('RATE_LIMIT_EXCEEDED', {
    endpoint,
    ip,
    userAgent
  });
};

const logPasswordValidationFailure = (email, ip, userAgent, validationErrors) => {
  logSecurity('PASSWORD_VALIDATION_FAILED', {
    email,
    validationErrors,
    ip,
    userAgent
  });
};

const logUnauthorizedAdminAccess = (userId, attemptedAction, ip, userAgent) => {
  logSecurity('UNAUTHORIZED_ADMIN_ACCESS_ATTEMPT', {
    userId,
    attemptedAction,
    ip,
    userAgent
  });
};

module.exports = {
  LOG_LEVELS,
  log,
  logSecurity,
  logAudit,
  logAdminCreation,
  logAdminLogin,
  logFailedAdminLogin,
  logRateLimitExceeded,
  logPasswordValidationFailure,
  logUnauthorizedAdminAccess
};