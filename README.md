# Crypto Dashboard — Paginated Source → Precomputed Chart

**Goal (per PDF):** Build a frontend utility & visualization around a **paginated data source**.
The (simulated) API returns **max 100 items per request**; we **efficiently fetch all (\~5000)**, **precompute on the server**, and render an **interactive bar chart** where the user can **switch performance metrics**.

## ✅ What’s implemented

- **Paginated data source (simulated)**: 100 items/page, \~5000 total.
- **Efficient fetch**: Server-side **worker-pool** (concurrency), **retry with backoff**, optional throttle (dev-only), order-preserving mode.
- **Precompute**: Server builds **Top N + Others** for **4 metrics**: `perf_24h | perf_7d | perf_30d | perf_90d`.
- **Aggregation switch (Others)**: `mean`, `sumAll`, `sumPositive`—precomputed for each metric, the client only displays.
- **Interactive bar chart**: ECharts with dataZoom slider, tooltip, responsive layout, metric/aggregation tabs.
- **SSR + Streaming**: Page shell streams fast via Suspense; chart data arrives once precomputed.
- **Error handling demo**: A UI button intentionally breaks the **next** server request so you can see the **error boundary** in action.

---

## Tech Stack

- **Next.js 15** (App Router, SSR/Streaming)
- **TypeScript**
- **ECharts** + `echarts-for-react` (dynamic import)
- **Tailwind CSS**
- **ESLint + Prettier**

> Note: `next-auth`, `postgres`, `zod`, etc. are present but **not required** for the chart task.

---

## Scripts

```bash
# Install
pnpm install

# Dev (with Turbopack)
pnpm dev

# Production
pnpm build
pnpm start
```

> Use **`pnpm dev`** for development; React Profiler works only in dev builds.

---

## Project Structure

```
app/
  (dashboard)/
    page.tsx               # SSR shell + Suspense/Streaming boundary
    _ChartServer.tsx       # Server Component: fetchAll + precompute → pass to client
    error.tsx              # Error boundary (Try again / Clear & Retry)
    loading.tsx            # Streaming skeleton
  _components/
    BreakNext.client.tsx   # Button: “Break next request” (error demo via URL param)
    Chart.client.tsx       # ECharts (client-only; dynamic import)
  layout.tsx
  globals.css
lib/
  types.ts                 # Metric, IDataDTO, IPaginatedData, ISeriesPoint...
  data/
    simSource.ts           # simulated paginated source (server-only)
  utils/
    fetchAll.ts            # worker-pool + retry/backoff/throttle (server-only)
  services/
    summary.ts             # buildTopNSeries + precomputeAllMetrics/AllAggs (server-only)
tailwind.config.ts
postcss.config.js
.eslintrc.json
.prettierrc
```

---

## How it works (high level)

1. **Simulated source** (`lib/data/simSource.ts`)
   - Generates \~5000 coins with 4 percent metrics.
   - Exposes `getSimulatedPage(page, size)` → returns **100 max**/page, with tiny artificial latency.

2. **Fetch all pages efficiently** (`lib/utils/fetchAll.ts`)
   - **Worker-pool** (e.g., 8 workers): limited parallelism to avoid overwhelming the server.
   - **Retry with exponential backoff** for transient errors.
   - Optional `throttleMs` between page fetches; optional `keepOrder`.
   - **Demonstration hook**: `injectFailurePage` to intentionally fail page N (used by the error demo).

3. **Precompute on the server** (`lib/services/summary.ts`)
   - Sort by metric, take **Top N**, aggregate the rest as **Others**.
   - **All metrics** × **all aggregations** (`mean | sumAll | sumPositive`) are precomputed.
   - Client receives only the series → **no heavy client compute**.

4. **Display**
   - `app/(dashboard)/_ChartServer.tsx` fetches + precomputes, then renders `Chart.client` with precomputed payload.
   - `Chart.client.tsx` (client-only) displays a bar chart with tabs to switch **metric** and **Others aggregation**.
   - **Streaming**: `page.tsx` wraps `_ChartServer` in `<Suspense fallback={<Skeleton/>}>`.

---

## Matching the PDF requirements

- **“Paginated data source (100 per request)”** → `getSimulatedPage` enforces `size ≤ 100`.
- **“Efficiently fetch all (\~5000)”** → `fetchAllCoins` with **worker-pool + retry/backoff**, optional throttle.
- **“Interactive chart; switch metrics”** → metric tabs (24h / 7d / 30d / 90d) + dataZoom, tooltip.
- **“Performance awareness”** → server precompute, dynamic import for ECharts, large/progressive series opts, SSR/Streaming.
- **“UX sensibility”** → readable axes, slider spacing, skeleton loading, error boundary UX.

---

## Try it

1. **Run dev**

   ```bash
   pnpm dev
   ```

   Open `http://localhost:3000/dashboard`.

2. **Switch metrics & aggregations**
   - Click `24H / 7D / 30D / 90D`.
   - Click `mean / sumAll / sumPositive`.
   - Use the bottom slider to zoom horizontally.

3. **See error handling**
   - Click **“Break next request”**.
   - The next server render intentionally fails (page 3), and you’ll land in the custom **error boundary**.
   - Click **Clear & Retry** to remove the flag and recover.

---

## Dev / Profiling Tips

- **React Profiler**: works in **dev** (`pnpm dev`). Use the Profiler tab to check render counts/time.
- **Why re-renders?** (optional) add a small `useWhyDidYouUpdate` hook to log prop changes in `Chart.client`.
- **Bundle size** (optional): switch to `echarts/core` + `echarts-for-react/lib/core` (tree-shaken) to only include Bar/Tooltip/Grid/DataZoom/CanvasRenderer.

---

## Performance notes

- **Concurrency cap** (default 8) avoids spamming the source.
- **Backoff & retry** absorb transient failures.
- **Throttle** exists but is off by default; you can enable for stricter rate-limit simulation.
- **Server precompute** keeps the client feather-light; switching metric/agg is instant.
- **Streaming** improves perceived performance.

---

## Accessibility & Responsiveness

- ECharts runs in a responsive container (`width: 100%`, height via CSS clamp).
- Axis labels rotate/shorten to avoid overlap; tooltip is confined within the chart card.
- You can enable `aria: { enabled: true }` in the ECharts option for screen-reader hints.

---

## Config

- **Top N**: default `50` (server).
- **Aggregations**: `mean` (default), `sumAll`, `sumPositive`.
- **Metrics**: `perf_24h | perf_7d | perf_30d | perf_90d`.
- **FetchAll options**: `pageSize`, `concurrency`, `maxRetries`, `baseDelayMs`, `keepOrder`, `throttleMs`, `injectFailurePage`.

> These are hardcoded for the assignment, but trivial to expose via URL/searchParams if you want a shareable state.

---

## Notes for reviewers

- This project **does not** hit a real exchange API; it uses a **deterministic simulator** to mimic a large, paginated source.
- The emphasis is on **architecture, performance discipline, and UX**:
  - server-only modules (`'server-only'`) to prevent accidental client bundling
  - streaming boundaries
  - decoupled utilities/services
  - dynamic import for heavy libs
