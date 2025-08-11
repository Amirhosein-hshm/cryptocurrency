import 'server-only';
import type { IDataDTO, IPaginatedData } from '../types';

const TOTAL = 5000;
const MAX_PAGE_SIZE = 100;

let CACHE: IDataDTO[] | null = null;

function prng(i: number): number {
  return ((i * 9301 + 49297) % 233280) / 233280; // 0..1
}

function buildDataset(): IDataDTO[] {
  if (CACHE) return CACHE;
  const arr: IDataDTO[] = Array.from({ length: TOTAL }, (_, idx) => {
    const r = prng(idx + 1);
    return {
      cryptocurrency: `Coin_${idx + 1}`,
      perf_24h: +((r * 2 - 1) * 20).toFixed(2),
      perf_7d: +((r * 2 - 1) * 40).toFixed(2),
      perf_30d: +((r * 2 - 1) * 100).toFixed(2),
      perf_90d: +((r * 2 - 1) * 200).toFixed(2),
    };
  });
  CACHE = arr;
  return arr;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function getSimulatedPage(page = 1, size = 100): Promise<IPaginatedData> {
  const all = buildDataset();
  const safeSize = Math.min(Math.max(1, size), MAX_PAGE_SIZE);
  const pages = Math.max(1, Math.ceil(all.length / safeSize));
  const safePage = Math.min(Math.max(1, page), pages);
  const start = (safePage - 1) * safeSize;
  const items = all.slice(start, start + safeSize);

  await sleep(30 + (safePage % 5) * 10);

  const mk = (p: number | null) => (p ? `/sim/coins?page=${p}&size=${safeSize}` : null);
  return {
    items,
    total: all.length,
    page: safePage,
    size: safeSize,
    pages,
    links: {
      first: mk(1),
      last: mk(pages),
      self: mk(safePage),
      next: mk(safePage < pages ? safePage + 1 : null),
      prev: mk(safePage > 1 ? safePage - 1 : null),
    },
  };
}
