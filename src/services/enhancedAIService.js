/**
 * Enhanced Unified AI Service
 *
 * This service provides a unified interface for AI operations with:
 * - Automatic provider selection (Vertex AI primary, OpenAI fallback)
 * - Response caching for cost savings
 * - Enhanced error handling with retry logic
 * - Rate limiting awareness
 * - Usage tracking and analytics
 * - Circuit breaker pattern for resilience
 */

import { VertexAIService } from './vertexAIService';
import { AIService as BackendAIService } from './aiService';
import { AIJobs } from './firestoreData';
import Toast from '../components/common/Toast';

// Circuit breaker configuration
const CIRCUIT_BREAKER_CONFIG = {
  failureThreshold: 5, // Number of failures before opening circuit
  resetTimeout: 60000, // Time to wait before attempting to close circuit (1 minute)
  halfOpenRequests: 3 // Number of requests to test in half-open state
};

class CircuitBreaker {
  constructor(config = CIRCUIT_BREAKER_CONFIG) {
    this.config = config;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failures = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();
  }

  async execute(fn, fallbackFn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        console.log('⚡ Circuit breaker OPEN, using fallback');
        return await fallbackFn();
      }
      this.state = 'HALF_OPEN';
      this.successCount = 0;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();

      if (this.state === 'OPEN') {
        console.log('⚡ Circuit breaker tripped, using fallback');
        return await fallbackFn();
      }

      throw error;
    }
  }

  onSuccess() {
    this.failures = 0;

    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.config.halfOpenRequests) {
        console.log('✅ Circuit breaker closing - service recovered');
        this.state = 'CLOSED';
        this.successCount = 0;
      }
    }
  }

  onFailure() {
    this.failures++;

    if (this.failures >= this.config.failureThreshold) {
      console.error(`🔴 Circuit breaker opening - ${this.failures} failures detected`);
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.config.resetTimeout;
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      nextAttempt: this.nextAttempt
    };
  }

  reset() {
    this.state = 'CLOSED';
    this.failures = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();
  }
}

// Initialize circuit breakers for each provider
const vertexAIBreaker = new CircuitBreaker();
const backendAIBreaker = new CircuitBreaker();

// Usage tracking
const usageStats = {
  totalRequests: 0,
  vertexAIRequests: 0,
  backendRequests: 0,
  cacheHits: 0,
  errors: 0,
  lastReset: Date.now()
};

/**
 * Determine which AI provider to use
 */
function selectProvider() {
  // Check if Vertex AI is available
  if (VertexAIService.isAvailable() && vertexAIBreaker.state !== 'OPEN') {
    return 'vertex-ai';
  }

  // Fallback to backend
  if (backendAIBreaker.state !== 'OPEN') {
    return 'backend';
  }

  // Both are failing, but prefer Vertex AI
  return 'vertex-ai';
}

/**
 * Track usage statistics
 */
function trackUsage(provider, fromCache = false, error = false) {
  usageStats.totalRequests++;

  if (fromCache) {
    usageStats.cacheHits++;
  } else if (provider === 'vertex-ai') {
    usageStats.vertexAIRequests++;
  } else if (provider === 'backend') {
    usageStats.backendRequests++;
  }

  if (error) {
    usageStats.errors++;
  }

  // Reset stats every hour
  if (Date.now() - usageStats.lastReset > 3600000) {
    console.log('📊 Hourly usage stats:', { ...usageStats });
    Object.keys(usageStats).forEach(key => {
      if (key !== 'lastReset') usageStats[key] = 0;
    });
    usageStats.lastReset = Date.now();
  }
}

/**
 * Execute AI operation with provider selection and fallback
 */
async function executeWithFallback(operation, vertexAIFn, backendFn) {
  const provider = selectProvider();

  try {
    if (provider === 'vertex-ai') {
      return await vertexAIBreaker.execute(
        async () => {
          const result = await vertexAIFn();
          trackUsage('vertex-ai', result.fromCache);
          return result;
        },
        async () => {
          console.log('🔄 Falling back to backend AI service');
          const result = await backendFn();
          trackUsage('backend', result.fromCache);
          return result;
        }
      );
    } else {
      return await backendAIBreaker.execute(
        async () => {
          const result = await backendFn();
          trackUsage('backend', result.fromCache);
          return result;
        },
        async () => {
          console.log('🔄 Falling back to Vertex AI service');
          const result = await vertexAIFn();
          trackUsage('vertex-ai', result.fromCache);
          return result;
        }
      );
    }
  } catch (error) {
    trackUsage(provider, false, true);
    throw error;
  }
}

export const EnhancedAIService = {
  /**
   * Summarize text with automatic provider selection
   */
  async summarize({ noteId, inputText, createdBy }) {
    return await executeWithFallback(
      'summarize',
      () => VertexAIService.summarize({ noteId, inputText, createdBy }),
      () => BackendAIService.summarize({ noteId, inputText, createdBy })
    );
  },

  /**
   * Generate MCQ questions with automatic provider selection
   */
  async generateMCQ({ inputText, count = 10, createdBy }) {
    return await executeWithFallback(
      'generateMCQ',
      () => VertexAIService.generateMCQ({ inputText, count, createdBy }),
      () => BackendAIService.generateMCQ({ inputText, count, createdBy })
    );
  },

  /**
   * Generate flashcards with automatic provider selection
   */
  async flashcards({ inputText, count = 20, createdBy }) {
    return await executeWithFallback(
      'flashcards',
      () => VertexAIService.flashcards({ inputText, count, createdBy }),
      () => BackendAIService.flashcards({ inputText, count, createdBy })
    );
  },

  /**
   * Generate concept map with automatic provider selection
   */
  async generateConceptMap({ inputText, createdBy }) {
    return await executeWithFallback(
      'generateConceptMap',
      () => VertexAIService.generateConceptMap({ inputText, createdBy }),
      () => BackendAIService.generateConceptMap({ inputText, createdBy })
    );
  },

  /**
   * Generate study questions with automatic provider selection
   */
  async generateQuestions({ inputText, createdBy }) {
    return await executeWithFallback(
      'generateQuestions',
      () => VertexAIService.generateQuestions({ inputText, createdBy }),
      () => BackendAIService.generateQuestions({ inputText, createdBy })
    );
  },

  /**
   * Match internships (backend only for now)
   */
  async matchInternships({ userSkills, internships }) {
    return await BackendAIService.matchInternships({ userSkills, internships });
  },

  /**
   * Check if AI service is configured
   */
  async isConfigured() {
    const vertexAvailable = VertexAIService.isAvailable();
    const backendAvailable = await BackendAIService.isConfigured();
    return vertexAvailable || backendAvailable;
  },

  /**
   * Get comprehensive model information
   */
  async getModelInfo() {
    const vertexInfo = VertexAIService.getModelInfo();
    const backendInfo = await BackendAIService.getModelInfo();

    return {
      primary: vertexInfo.configured ? 'Vertex AI (Gemini)' : 'Backend (OpenAI)',
      providers: {
        vertexAI: vertexInfo,
        backend: backendInfo
      },
      circuitBreakers: {
        vertexAI: vertexAIBreaker.getState(),
        backend: backendAIBreaker.getState()
      },
      usageStats: { ...usageStats },
      features: [
        'Multi-provider support (Vertex AI + OpenAI)',
        'Automatic failover and fallback',
        'Response caching for cost savings',
        'Circuit breaker pattern for resilience',
        'Exponential backoff retry logic',
        'Usage tracking and analytics',
        'Error recovery strategies'
      ]
    };
  },

  /**
   * Get current usage statistics
   */
  getUsageStats() {
    return {
      ...usageStats,
      cacheHitRate: usageStats.totalRequests > 0
        ? ((usageStats.cacheHits / usageStats.totalRequests) * 100).toFixed(2) + '%'
        : '0%',
      errorRate: usageStats.totalRequests > 0
        ? ((usageStats.errors / usageStats.totalRequests) * 100).toFixed(2) + '%'
        : '0%'
    };
  },

  /**
   * Get circuit breaker status
   */
  getCircuitBreakerStatus() {
    return {
      vertexAI: vertexAIBreaker.getState(),
      backend: backendAIBreaker.getState()
    };
  },

  /**
   * Reset circuit breakers (admin function)
   */
  resetCircuitBreakers() {
    vertexAIBreaker.reset();
    backendAIBreaker.reset();
    console.log('🔄 Circuit breakers reset');
    Toast.success('Circuit breakers reset successfully');
  },

  /**
   * Clear all caches
   */
  clearAllCaches() {
    VertexAIService.clearCache();
    console.log('🗑️ All caches cleared');
    Toast.success('All caches cleared successfully');
  },

  /**
   * Reinitialize all services
   */
  async reinitialize() {
    await VertexAIService.reinitialize();
    await BackendAIService.reinitialize();
    this.resetCircuitBreakers();
    console.log('🔄 All AI services reinitialized');
    Toast.success('AI services reinitialized successfully');
  },

  /**
   * Get comprehensive health status
   */
  async getHealthStatus() {
    const modelInfo = await this.getModelInfo();
    const usageStats = this.getUsageStats();
    const circuitBreakers = this.getCircuitBreakerStatus();

    return {
      status: modelInfo.providers.vertexAI.configured || modelInfo.providers.backend.configured ? 'healthy' : 'unavailable',
      providers: modelInfo.providers,
      circuitBreakers,
      usage: usageStats,
      timestamp: new Date().toISOString()
    };
  }
};

export default EnhancedAIService;
