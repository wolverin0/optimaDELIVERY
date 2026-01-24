/**
 * Retry wrapper for async functions that might fail due to AbortError.
 * This is particularly useful in development with React Strict Mode.
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    options: { maxRetries?: number; delayMs?: number } = {}
): Promise<T> {
    const { maxRetries = 3, delayMs = 100 } = options;

    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (err: any) {
            lastError = err;

            // Check if it's an AbortError
            const isAbortError =
                err?.name === 'AbortError' ||
                err?.message?.includes('AbortError') ||
                err?.message?.includes('signal is aborted');

            // Only retry on AbortError
            if (isAbortError && attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
                continue;
            }

            throw err;
        }
    }

    throw lastError;
}

/**
 * Wrapper for Supabase query that retries on AbortError.
 */
export async function supabaseQuery<T>(
    queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: any }> {
    try {
        return await withRetry(queryFn);
    } catch (err: any) {
        // If it's still an AbortError after retries, return as a handled error
        if (err?.name === 'AbortError' || err?.message?.includes('AbortError')) {
            if (import.meta.env.DEV) console.warn('Supabase query aborted after retries');
            return { data: null, error: null };
        }
        throw err;
    }
}
