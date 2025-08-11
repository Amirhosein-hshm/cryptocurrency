'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import type { ISeriesByMetric, Metric } from '@/lib/types';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

type Props = {
  precomputed: ISeriesByMetric;
  defaultMetric: Metric;
  top: number;
};

export default function Chart({ precomputed, defaultMetric, top }: Props) {
  const [metric, setMetric] = useState<Metric>(defaultMetric);
  const points = precomputed[metric];

  const option = useMemo(
    () => ({
      tooltip: { trigger: 'axis' },
      grid: { left: 12, right: 12, top: 24, bottom: 24, containLabel: true },
      xAxis: {
        type: 'category',
        data: points.map((p) => p.name),
        axisLabel: { rotate: 45, hideOverlap: true },
      },
      yAxis: { type: 'value', name: metric },
      series: [
        { type: 'bar', data: points.map((p) => p.value), large: true, animationDuration: 300 },
      ],
      dataZoom: [{ type: 'inside' }, { type: 'slider' }],
    }),
    [points, metric],
  );

  const metrics: Metric[] = ['perf_24h', 'perf_7d', 'perf_30d', 'perf_90d'];

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
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
        <span className="text-sm text-zinc-500 ml-2">Top {top} + Others</span>
      </div>
      <div className="card">
        <ReactECharts option={option} style={{ width: '100%', height: 480 }} />
      </div>
    </section>
  );
}
