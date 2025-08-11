import 'server-only';
import type { IDataDTO, ISeriesPoint, ISeriesByMetric, Metric } from '../types';

export type OthersAggregation = 'sumPositive' | 'sumAll' | 'mean';

export function buildTopNSeries(
  data: IDataDTO[],
  metric: Metric,
  N = 50,
  othersAgg: OthersAggregation = 'sumPositive',
): ISeriesPoint[] {
  if (!data.length) return [];

  const sorted = [...data].sort((a, b) => b[metric] - a[metric]);

  const top = sorted.slice(0, Math.max(0, N)).map((d) => ({
    name: d.cryptocurrency,
    value: d[metric],
  }));

  const tail = sorted.slice(N);
  if (tail.length === 0) return top;

  let othersValue: number;
  if (othersAgg === 'sumPositive') {
    othersValue = tail.reduce((s, d) => s + Math.max(0, d[metric]), 0);
  } else if (othersAgg === 'sumAll') {
    othersValue = tail.reduce((s, d) => s + d[metric], 0);
  } else {
    // mean
    othersValue = tail.reduce((s, d) => s + d[metric], 0) / tail.length;
  }

  return [...top, { name: 'Others', value: +othersValue.toFixed(2) }];
}

export function precomputeAllMetrics(
  data: IDataDTO[],
  N = 50,
  othersAgg: OthersAggregation = 'sumPositive',
): { top: number; seriesByMetric: ISeriesByMetric } {
  const metrics: Metric[] = ['perf_24h', 'perf_7d', 'perf_30d', 'perf_90d'];
  const seriesByMetric = Object.fromEntries(
    metrics.map((m) => [m, buildTopNSeries(data, m, N, othersAgg)]),
  ) as ISeriesByMetric;

  return { top: N, seriesByMetric };
}
