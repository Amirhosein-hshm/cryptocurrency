'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import type { Metric, ISeriesByMetric } from '@/lib/types';
import type { OthersAggregation } from '@/lib/services/summary';
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });
type PrecomputedPack = { top: number; seriesByMetric: ISeriesByMetric };

type Props = {
  precomputedByAgg: Record<OthersAggregation, PrecomputedPack>;
  defaultMetric: Metric;
  defaultAgg: OthersAggregation;
  top: number;
};

export default function Chart({ precomputedByAgg, defaultMetric, defaultAgg, top }: Props) {
  const [metric, setMetric] = useState<Metric>(defaultMetric);
  const [agg, setAgg] = useState<OthersAggregation>(defaultAgg);

  const current = precomputedByAgg[agg].seriesByMetric[metric];
  const categories = useMemo(() => current.map((p) => p.name), [current]);
  const values = useMemo(() => current.map((p) => p.value), [current]);

  const option = useMemo(
    () => ({
      tooltip: { trigger: 'axis', confine: true, axisPointer: { type: 'shadow' } },
      grid: { left: 12, right: 12, top: 28, bottom: 56, containLabel: true },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: { rotate: 35, hideOverlap: true, margin: 12 },
        axisTick: { alignWithLabel: true },
      },
      yAxis: {
        type: 'value',
        name: metric,
        nameLocation: 'middle',
        nameGap: 38,
      },
      series: [
        {
          type: 'bar',
          data: values,
          large: true,
          animationDuration: 300,
          barMaxWidth: 18,
          showBackground: true,
          backgroundStyle: { opacity: 0.05 },
          itemStyle: { borderRadius: [6, 6, 0, 0] },
          emphasis: { focus: 'series' },
        },
      ],
      dataZoom: [
        { type: 'inside', filterMode: 'none' },
        {
          type: 'slider',
          filterMode: 'none',
          height: 12,
          bottom: 8,
          brushSelect: false,
          handleSize: '60%',
        },
      ],
    }),
    [categories, values, metric],
  );

  const metrics: Metric[] = ['perf_24h', 'perf_7d', 'perf_30d', 'perf_90d'];
  const aggs: OthersAggregation[] = ['mean', 'sumAll', 'sumPositive'];
  return (
    <section className="space-y-3">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* metric tabs */}
        {metrics.map((m) => (
          <button
            key={m}
            onClick={() => setMetric(m)}
            className={`px-3 py-1 rounded-2xl border text-sm ${m === metric ? 'bg-black text-white' : 'hover:bg-zinc-100'}`}
            aria-pressed={m === metric}
          >
            {m.replace('perf_', '').toUpperCase()}
          </button>
        ))}
        <span className="mx-2 text-zinc-300">|</span>
        {aggs.map((a) => (
          <button
            key={a}
            onClick={() => setAgg(a)}
            className={`px-3 py-1 rounded-2xl border text-sm ${a === agg ? 'bg-black text-white' : 'hover:bg-zinc-100'}`}
            title={
              a === 'mean'
                ? 'Average of Others'
                : a === 'sumAll'
                  ? 'Sum of all Others (pos+neg)'
                  : 'Sum of positive Others only'
            }
            aria-pressed={a === agg}
          >
            {a}
          </button>
        ))}

        <span className="text-sm text-zinc-500 ml-2">Top {top} + Others</span>
      </div>

      <div className="card">
        <ReactECharts option={option} style={{ width: '100%', height: 480 }} />
      </div>
    </section>
  );
}
