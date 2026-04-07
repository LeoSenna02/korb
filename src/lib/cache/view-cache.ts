interface CacheEntry<T> {
  data: T;
  updatedAt: number;
}

const viewCache = new Map<string, CacheEntry<unknown>>();
const inFlightRequests = new Map<string, Promise<unknown>>();

export function readViewCache<T>(key: string): T | null {
  const entry = viewCache.get(key);
  return (entry?.data as T | undefined) ?? null;
}

export function writeViewCache<T>(key: string, data: T): void {
  viewCache.set(key, {
    data,
    updatedAt: Date.now(),
  });
}

export async function loadViewCache<T>(
  key: string,
  loader: () => Promise<T>
): Promise<T> {
  const existing = inFlightRequests.get(key) as Promise<T> | undefined;
  if (existing) {
    return existing;
  }

  const request = loader()
    .then((result) => {
      writeViewCache(key, result);
      return result;
    })
    .finally(() => {
      inFlightRequests.delete(key);
    });

  inFlightRequests.set(key, request);
  return request;
}
