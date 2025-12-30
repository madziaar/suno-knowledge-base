

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Type Guard for Errors
function isErrorLike(value: unknown): value is { message: string; response?: any } {
  return typeof value === 'object' && value !== null && 'message' in value;
}

export const parseError = (e: unknown): string => {
  const msg = String(e).toLowerCase();
  const rawMsg = isErrorLike(e) ? e.message : String(e);
  const errorObj = isErrorLike(e) ? e : null;

  // 1. Rate Limiting / Quota
  if (msg.includes('429') || msg.includes('quota') || msg.includes('exhausted')) {
    return "CORE OVERLOAD (429): API Rate Limit Exceeded. The forge is running too hot. Cool down for 60 seconds and try again.";
  }

  // 2. Server Issues
  if (msg.includes('503') || msg.includes('500') || msg.includes('overloaded') || msg.includes('internal')) {
    return "SYSTEM FAILURE (503): Gemini Servers Unresponsive. The neural link is severed. Please retry in a moment.";
  }

  // 3. Safety Filters
  if (msg.includes('safety') || msg.includes('blocked') || (errorObj?.response?.promptFeedback?.blockReason)) {
    return "SAFETY LOCKOUT: Content flagged by corporate protocols. Your prompt might be too spicy or controversial. Try softening the language.";
  }

  // 4. Auth / Permissions
  if (msg.includes('key') || msg.includes('permission') || msg.includes('403')) {
    return "ACCESS DENIED (403): Invalid API Key or Permissions. Please check your credentials.";
  }

  // 5. Network / Offline
  if (msg.includes('fetch') || msg.includes('network') || msg.includes('offline')) {
    return "CONNECTION LOST: Unable to reach the AI Core. Check your internet connection.";
  }
  
  // Default Fallback with sanitization
  const cleanMsg = rawMsg.replace(/apikey/gi, '***').substring(0, 150);
  return `UNKNOWN NEURAL FRACTURE: ${cleanMsg}... Check console for full details.`;
};

/**
 * Retries a function with exponential backoff.
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  initialDelay: number = 1000,
  factor: number = 2
): Promise<T> {
  let currentDelay = initialDelay;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: unknown) {
      const msg = isErrorLike(error) ? error.message : String(error);
      const isRetryable = msg.includes('429') || msg.includes('503') || msg.includes('fetch');
      
      if (i === retries - 1 || !isRetryable) {
        throw error;
      }
      
      console.warn(`[Retry System] Attempt ${i + 1} failed. Retrying in ${currentDelay}ms...`, error);
      await delay(currentDelay);
      currentDelay *= factor;
    }
  }
  throw new Error("Unreachable");
}

/**
 * Circuit Breaker implementation to prevent cascading failures.
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private readonly threshold = 5;
  private readonly resetTimeout = 60000; // 60s cooldown

  public async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      throw new Error("CIRCUIT_OPEN: Too many failures. System is cooling down.");
    }

    try {
      const result = await fn();
      this.reset();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private isOpen(): boolean {
    if (this.failures >= this.threshold) {
      const now = Date.now();
      if (now - this.lastFailureTime > this.resetTimeout) {
        this.reset(); // Half-open/Reset logic
        return false;
      }
      return true;
    }
    return false;
  }

  private recordFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
  }

  private reset() {
    this.failures = 0;
    this.lastFailureTime = 0;
  }
}

export const globalCircuitBreaker = new CircuitBreaker();
