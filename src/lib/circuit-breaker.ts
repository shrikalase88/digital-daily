/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascading failures when external services are down
 * Used by: Google, Amazon, Netflix for resilience
 */

export enum CircuitState {
  CLOSED = "CLOSED",      // Normal operation
  OPEN = "OPEN",          // Failing, reject requests
  HALF_OPEN = "HALF_OPEN", // Testing if service recovered
}

interface CircuitBreakerOptions {
  failureThreshold?: number;     // Failures before opening circuit
  successThreshold?: number;     // Successes before closing circuit
  timeout?: number;              // Time before trying again (ms)
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime: number | null = null;
  
  private readonly failureThreshold: number;
  private readonly successThreshold: number;
  private readonly timeout: number;

  constructor(
    private readonly name: string,
    options: CircuitBreakerOptions = {}
  ) {
    this.failureThreshold = options.failureThreshold ?? 5;
    this.successThreshold = options.successThreshold ?? 2;
    this.timeout = options.timeout ?? 60000; // 1 minute default
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
        console.log(`[CircuitBreaker:${this.name}] Attempting reset (HALF_OPEN)`);
      } else {
        throw new Error(`Circuit breaker OPEN for ${this.name}`);
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return true;
    return Date.now() - this.lastFailureTime >= this.timeout;
  }

  private onSuccess(): void {
    this.failureCount = 0;
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount += 1;
      if (this.successCount >= this.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.successCount = 0;
        console.log(`[CircuitBreaker:${this.name}] Circuit CLOSED (recovered)`);
      }
    }
  }

  private onFailure(): void {
    this.failureCount += 1;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN;
      console.log(`[CircuitBreaker:${this.name}] Circuit OPEN (reset failed)`);
    } else if (this.failureCount >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
      console.log(`[CircuitBreaker:${this.name}] Circuit OPEN (threshold reached: ${this.failureCount})`);
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  getStats(): { state: string; failureCount: number; successCount: number } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
    };
  }
}

// Global circuit breakers for external services
export const circuitBreakers = {
  yahooFinance: new CircuitBreaker("YahooFinance", {
    failureThreshold: 3,
    timeout: 120000, // 2 minutes
  }),
  cricbuzz: new CircuitBreaker("Cricbuzz", {
    failureThreshold: 3,
    timeout: 120000,
  }),
  openMeteo: new CircuitBreaker("OpenMeteo", {
    failureThreshold: 5,
    timeout: 60000,
  }),
  rssFeeds: new CircuitBreaker("RSSFeeds", {
    failureThreshold: 10,
    timeout: 180000, // 3 minutes
  }),
};