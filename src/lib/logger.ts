/**
 * Privacy-First Logging Utility (Server-Side Only)
 * 
 * Uses Pino for structured logging without external services.
 * All logs stay local for GDPR compliance and cost efficiency.
 * 
 * ⚠️ This module should only be imported in server components and server actions.
 * For client-side logging, use the browser console directly.
 */

import pino from 'pino';

// Only create logger in Node.js environment
const isServer = typeof window === 'undefined';

// Determine environment
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Create a logger instance with appropriate configuration
 */
const createLogger = () => {
  if (!isServer) {
    // Return a no-op logger for client-side (should never be called)
    return {
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
      fatal: () => {},
      child: () => createLogger(),
    } as unknown as pino.Logger;
  }

  // Development: Pretty printing to console
  if (isDevelopment) {
    return pino({
      level: 'debug',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
        },
      },
    });
  }

  // Production: JSON logs with minimal overhead
  if (isProduction) {
    return pino({
      level: 'info',
      formatters: {
        level: (label) => ({ level: label }),
      },
      timestamp: pino.stdTimeFunctions.isoTime,
      // Redact sensitive fields
      redact: {
        paths: ['apiKey', 'password', 'token', 'authorization', 'cookie'],
        remove: true,
      },
    });
  }

  // Fallback: Standard console logs
  return pino({
    level: 'info',
  });
};

// Singleton logger instance
export const logger = isServer ? createLogger() : null;

/**
 * Generate a unique correlation ID for request tracking
 */
export const generateCorrelationId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Child logger with correlation ID (server-side only)
 */
export const createCorrelatedLogger = (correlationId?: string) => {
  if (!isServer || !logger) {
    return null;
  }
  const id = correlationId || generateCorrelationId();
  return logger.child({ correlationId: id });
};

/**
 * Log levels with correlation support (server-side only)
 */
export const log = {
  /**
   * Debug level - development only
   */
  debug: (message: string, data?: Record<string, unknown>) => {
    if (isServer && logger && isDevelopment) {
      logger.debug(data, message);
    }
  },

  /**
   * Info level - general information
   */
  info: (message: string, data?: Record<string, unknown>) => {
    if (isServer && logger) {
      logger.info(data, message);
    }
  },

  /**
   * Warning level - something unusual but handled
   */
  warn: (message: string, data?: Record<string, unknown>) => {
    if (isServer && logger) {
      logger.warn(data, message);
    }
  },

  /**
   * Error level - something went wrong
   */
  error: (message: string, error?: Error | unknown, data?: Record<string, unknown>) => {
    if (isServer && logger) {
      const errorData = error instanceof Error
        ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
            ...data,
          }
        : { error, ...data };

      logger.error(errorData, message);
    }
  },

  /**
   * Fatal level - critical error requiring attention
   */
  fatal: (message: string, error?: Error | unknown, data?: Record<string, unknown>) => {
    if (isServer && logger) {
      const errorData = error instanceof Error
        ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
            ...data,
          }
        : { error, ...data };

      logger.fatal(errorData, message);
    }
  },
};

/**
 * Performance timing utility (server-side only)
 */
export const createTimer = (label: string) => {
  const start = Date.now();
  
  return {
    end: (data?: Record<string, unknown>) => {
      const duration = Date.now() - start;
      log.info(`${label} completed`, { duration, ...data });
      return duration;
    },
  };
};

/**
 * Log AI/API interactions with structured data (server-side only)
 */
export const logAIInteraction = {
  start: (provider: string, model: string, correlationId: string) => {
    log.info('AI interaction started', {
      correlationId,
      provider,
      model,
      timestamp: new Date().toISOString(),
    });
  },

  success: (provider: string, model: string, correlationId: string, duration: number) => {
    log.info('AI interaction succeeded', {
      correlationId,
      provider,
      model,
      duration,
      timestamp: new Date().toISOString(),
    });
  },

  error: (provider: string, model: string, correlationId: string, error: Error) => {
    log.error('AI interaction failed', error, {
      correlationId,
      provider,
      model,
      timestamp: new Date().toISOString(),
    });
  },
};

/**
 * Log database operations (server-side only)
 */
export const logDBOperation = {
  query: (operation: string, collection: string, correlationId?: string) => {
    log.debug('Database operation', {
      correlationId: correlationId || generateCorrelationId(),
      operation,
      collection,
      timestamp: new Date().toISOString(),
    });
  },

  error: (operation: string, collection: string, error: Error, correlationId?: string) => {
    log.error('Database operation failed', error, {
      correlationId: correlationId || generateCorrelationId(),
      operation,
      collection,
      timestamp: new Date().toISOString(),
    });
  },
};

/**
 * Log user actions (privacy-aware - no PII) (server-side only)
 */
export const logUserAction = {
  search: (domain: string, correlationId: string) => {
    log.info('User search initiated', {
      correlationId,
      domain,
      timestamp: new Date().toISOString(),
    });
  },

  save: (offerType: string, correlationId: string) => {
    log.info('User saved offer', {
      correlationId,
      offerType,
      timestamp: new Date().toISOString(),
    });
  },

  analyze: (offerCount: number, model: string, correlationId: string) => {
    log.info('Analysis performed', {
      correlationId,
      offerCount,
      model,
      timestamp: new Date().toISOString(),
    });
  },
};

export default logger;
