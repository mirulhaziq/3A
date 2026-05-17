import { logger } from './logger';

async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error = new Error('Unknown error');

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      const status = (err as { status?: number }).status;
      if (status !== undefined && status >= 400 && status < 500) {
        throw lastError;
      }

      if (attempt < maxAttempts - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        logger.warn(
          { attempt: attempt + 1, error: lastError.message, delay },
          'Retrying after failure'
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

export { retry };
