export function ChartSkeleton() {
  return (
    <section className="card p-4 overflow-hidden h-full">
      <div className="mb-3 space-y-2">
        <div className="h-6 w-48 bg-zinc-100 rounded animate-pulse" />
        <div className="h-4 w-80 bg-zinc-100 rounded animate-pulse" />
      </div>

      <div className="mb-4 flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-16 rounded-2xl border bg-white">
            <div className="h-full w-full rounded-2xl bg-zinc-100 animate-pulse" />
          </div>
        ))}
      </div>

      <div className="relative h-[420px] rounded-2xl border overflow-hidden bg-gradient-to-b from-white to-zinc-50">
        <div className="absolute inset-x-0 top-1/6 h-px bg-zinc-200/70" />
        <div className="absolute inset-x-0 top-2/6 h-px bg-zinc-200/60" />
        <div className="absolute inset-x-0 top-3/6 h-px bg-zinc-200/50" />
        <div className="absolute inset-x-0 top-4/6 h-px bg-zinc-200/40" />
        <div className="absolute inset-x-0 top-5/6 h-px bg-zinc-200/30" />

        <div className="absolute inset-4 flex items-end gap-2">
          {Array.from({ length: 28 }).map((_, i) => (
            <div
              key={i}
              className="w-4 bg-zinc-100 rounded-t animate-pulse"
              style={{ height: `${40 + ((i * 7) % 60)}%` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
