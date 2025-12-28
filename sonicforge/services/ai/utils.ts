
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Type Guard for Errors
function isErrorLike(value: unknown): value is { message: string; response?: any; status?: number } {
  return typeof value === 'object' && value !== null && ('message' in value || 'status' in value);
}

/**
 * Identifies if an error is transient (retryable) based on status code or message.
 */
export const isTransientError = (e: unknown): boolean => {
    const msg = String(e).toLowerCase();
    // 429 (Quota), 503 (Unavailable), 504 (Timeout), 502 (Bad Gateway), or generic fetch errors
    return msg.includes('429') || 
           msg.includes('503') || 
           msg.includes('504') || 
           msg.includes('502') || 
           msg.includes('fetch') || 
           msg.includes('network') ||
           msg.includes('timeout') ||
           msg.includes('internal error');
};

/**
 * Maps complex AI/Network errors to human-readable instructions and recovery paths.
 */
export const parseError = (e: unknown, lang: 'en' | 'pl' = 'en'): string => {
  const rawMsg = isErrorLike(e) ? e.message : String(e);
  const msg = rawMsg.toLowerCase();

  const t = {
    auth: lang === 'pl' ? "ODMOWA DOSTĘPU: Klucz API jest nieprawidłowy lub wygasł. Sprawdź konfigurację terminala." : "ACCESS DENIED: API key is invalid or expired. Check your terminal configuration.",
    quota: lang === 'pl' ? "PRZECIĄŻENIE RDZENIA (429): Osiągnięto limit zapytań. Odczekaj 60 sekund przed ponowną próbą." : "CORE OVERLOAD (429): API Quota Exhausted. Wait 60 seconds before retrying.",
    server: lang === 'pl' ? "NIESTABILNOŚĆ NEURONOWA (5xx): Serwery Google są przeciążone. Spróbuj wygenerować ponownie za chwilę." : "NEURAL INSTABILITY (5xx): Google servers are overloaded. Try regenerating in a moment.",
    safety: lang === 'pl' ? "BLOKADA BEZPIECZEŃSTWA: Wykryto zastrzeżone treści. Spróbuj zmienić opis konceptu na bardziej subtelny." : "SAFETY LOCKOUT: Restricted content detected. Try rephrasing your concept to be more subtle.",
    malformed: lang === 'pl' ? "KORUPCJA DANYCH: AI wyprodukowało nieczytelny format. Zrestartuj proces generowania." : "DATA CORRUPTION: The AI produced an unreadable format. Restart the generation process.",
    network: lang === 'pl' ? "BRAK ŁĄCZNOŚCI: Utracono połączenie z rdzeniem AI. Sprawdź swoje połączenie internetowe." : "NEURAL DISCONNECT: Connection to AI Core lost. Check your internet connection."
  };

  if (msg.includes('api key not valid') || msg.includes('permission denied') || msg.includes('403') || msg.includes('401')) return t.auth;
  if (msg.includes('429') || msg.includes('quota') || msg.includes('resource has been exhausted')) return t.quota;
  if (msg.includes('503') || msg.includes('504') || msg.includes('502') || msg.includes('internal error') || msg.includes('server error')) return t.server;
  if (msg.includes('safety') || msg.includes('blocked due to safety')) return t.safety;
  if (msg.includes('malformed') || msg.includes('invalid json')) return t.malformed;
  if (msg.includes('fetch failed') || msg.includes('network request failed') || msg.includes('offline')) return t.network;

  return lang === 'pl' 
    ? `BŁĄD SYSTEMU: ${rawMsg.substring(0, 100)}... Spróbuj odświeżyć stronę.` 
    : `SYSTEM ERROR: ${rawMsg.substring(0, 100)}... Try refreshing the page.`;
};

/**
 * Retries an asynchronous function with exponential backoff and jitter.
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
      if (i === retries - 1 || !isTransientError(error)) throw error;
      const jitter = (Math.random() * 0.4 - 0.2) * currentDelay;
      await delay(Math.max(100, currentDelay + jitter));
      currentDelay *= factor;
    }
  }
  throw new Error("Retry sequence exhausted.");
}

export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private readonly threshold = 5;
  private readonly resetTimeout = 60000;

  public async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.isOpen()) throw new Error("CIRCUIT_OPEN: Cooling down for 60s.");
    try {
      const result = await fn();
      this.reset();
      return result;
    } catch (error) {
      if (!isTransientError(error)) this.recordFailure();
      throw error;
    }
  }
  private isOpen(): boolean {
    if (this.failures >= this.threshold) {
      const now = Date.now();
      if (now - this.lastFailureTime > this.resetTimeout) { this.reset(); return false; }
      return true;
    }
    return false;
  }
  private recordFailure() { this.failures++; this.lastFailureTime = Date.now(); }
  private reset() { this.failures = 0; this.lastFailureTime = 0; }
}

export const globalCircuitBreaker = new CircuitBreaker();
