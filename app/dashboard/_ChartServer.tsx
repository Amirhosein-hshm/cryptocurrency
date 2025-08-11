import { fetchAllCoins } from '@/lib/utils/fetchAll';
import { precomputeAllMetrics } from '@/lib/services/summary';
import Chart from '@/app/_components/Chart.client';
import type { Metric } from '@/lib/types';

export default async function ChartServer() {
  const all = await fetchAllCoins({ pageSize: 100, concurrency: 8 });

  const { top, seriesByMetric } = precomputeAllMetrics(all, 50, 'mean');

  return <Chart precomputed={seriesByMetric} defaultMetric={'perf_7d' as Metric} top={top} />;
}
