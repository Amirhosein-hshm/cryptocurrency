import { fetchAllCoins } from '@/lib/utils/fetchAll';
import { precomputeAllAggs } from '@/lib/services/summary';
import Chart from '@/app/_components/Chart.client';
import type { Metric } from '@/lib/types';

export default async function ChartServer() {
  const all = await fetchAllCoins({ pageSize: 100, concurrency: 8 });

  const precomputedByAgg = precomputeAllAggs(all, 50);

  return (
    <Chart
      precomputedByAgg={precomputedByAgg}
      defaultMetric={'perf_7d' as Metric}
      defaultAgg="mean"
      top={50}
    />
  );
}
