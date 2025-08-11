import 'server-only';
import type { IDataDTO, IPaginatedData } from '../types';
import { getSimulatedPage } from '../data/simSource';

type FetchAllOptions = {
  pageSize?: number;
  concurrency?: number;
  maxRetries?: number;
  baseDelayMs?: number;
  keepOrder?: boolean;
  throttleMs?: number;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  baseDelayMs: number,
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= maxRetries) throw err;
      const jitter = Math.random() * 50;
      const delay = baseDelayMs * Math.pow(2, attempt) + jitter;
      await sleep(delay);
      attempt++;
    }
  }
}

export async function fetchAllCoins({
  pageSize = 100,
  concurrency = 8,
  maxRetries = 2,
  baseDelayMs = 120,
  keepOrder = false,
  throttleMs = 0,
}: FetchAllOptions = {}): Promise<IDataDTO[]> {
  const first: IPaginatedData = await withRetry(
    () => getSimulatedPage(1, pageSize),
    maxRetries,
    baseDelayMs,
  );
  const totalPages = first.pages;

  const results: IDataDTO[] = keepOrder ? [] : [...first.items];
  const pageBuckets: IDataDTO[][] | null = keepOrder
    ? Array.from({ length: totalPages }, () => [])
    : null;

  if (keepOrder && pageBuckets) pageBuckets[0] = first.items;

  let nextPage = 2;

  async function worker() {
    while (true) {
      const p = nextPage++;
      if (p > totalPages) break;
      const page = await withRetry(() => getSimulatedPage(p, pageSize), maxRetries, baseDelayMs);
      if (keepOrder && pageBuckets) {
        pageBuckets[p - 1] = page.items;
      } else {
        results.push(...page.items);
      }
      if (throttleMs > 0) await sleep(throttleMs);
    }
  }

  const workerCount = Math.min(concurrency, Math.max(1, totalPages - 1));
  await Promise.all(Array.from({ length: workerCount }, worker));

  if (keepOrder && pageBuckets) {
    for (const bucket of pageBuckets) results.push(...bucket);
  }
  return results;
}
