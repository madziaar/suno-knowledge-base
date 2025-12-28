
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function isErrorLike(value: unknown): value is { message: string; status?: number } {
  return typeof value === 'object' && value !== null && ('message' in value || 'status' in value);
}

export const isTransientError = (e: unknown): boolean => {
    const msg = String(e).toLowerCase();
    return msg.includes('429') || 
           msg.includes('503') || 
           msg.includes('504') || 
           msg.includes('quota') ||
           msg.includes('fetch') ||
           msg.includes('network');
};

export const parseError = (e: unknown, lang: 'en' | 'pl' = 'en'): string => {
  const rawMsg = isErrorLike(e) ? e.message : String(e);
  const msg = rawMsg.toLowerCase();

  const t = {
    auth: lang === 'pl' ? "Nie można wygenerować. Sprawdź klucz API." : "Unable to generate. Please check your API key.",
    quota: lang === 'pl' ? "Limit zapytań wyczerpany (429). Spróbuj za chwilę." : "Quota exhausted (429). Please try again in a moment.",
    safety: lang === 'pl' ? "Blokada bezpieczeństwa: Treść narusza politykę." : "Safety lockout: Content violates policy.",
    malformed: lang === 'pl' ? "Błąd formatowania danych modelu." : "Malformed model response data."
  };

  if (msg.includes('api key') || msg.includes('403')) return t.auth;
  if (msg.includes('429') || msg.includes('quota')) return t.quota;
  if (msg.includes('safety') || msg.includes('blocked')) return t.safety;
  if (msg.includes('malformed') || msg.includes('json')) return t.malformed;

  return lang === 'pl' ? `Błąd systemu: ${rawMsg.substring(0, 80)}...` : `System error: ${rawMsg.substring(0, 80)}...`;
};

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let currentDelay = initialDelay;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: unknown) {
      if (i === retries - 1 || !isTransientError(error)) throw error;
      await delay(currentDelay);
      currentDelay *= 2;
    }
  }
  throw new Error("Retry exhausted.");
}

export class CircuitBreaker {
  private failures = 0;
  private lastFailure = 0;
  private threshold = 5;
  private cooldown = 60000;

  public async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.failures >= this.threshold && Date.now() - this.lastFailure < this.cooldown) {
        throw new Error("CIRCUIT_OPEN: System resting.");
    }
    try {
      const result = await fn();
      this.failures = 0;
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailure = Date.now();
      throw error;
    }
  }
}

export const globalCircuitBreaker = new CircuitBreaker();
