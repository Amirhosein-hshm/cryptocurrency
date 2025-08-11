import { ChartSkeleton } from '../_components/ChartSkeleton';
import { Suspense } from 'react';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

import ChartServer from './_ChartServer';

export default async function Page() {
  return (
    <main className="container mx-auto p-4 space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">Market performance</h1>
        <p className="text-sm text-zinc-500">Precomputed Top N + Others for 24h / 7d / 30d / 90d</p>
      </header>

      <Suspense fallback={<ChartSkeleton />}>
        <ChartServer />
      </Suspense>
    </main>
  );
}
