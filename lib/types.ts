export type Metric = 'perf_24h' | 'perf_7d' | 'perf_30d' | 'perf_90d';

export interface IDataDTO {
  cryptocurrency: string;
  perf_24h: number;
  perf_7d: number;
  perf_30d: number;
  perf_90d: number;
}

export interface IPaginatedData {
  items: IDataDTO[];
  total: number;
  page: number;
  size: number;
  pages: number;
  links: {
    first: string | null;
    last: string | null;
    self: string | null;
    next: string | null;
    prev: string | null;
  };
}

export interface ISeriesPoint {
  name: string;
  value: number;
}

export type ISeriesByMetric = Record<Metric, ISeriesPoint[]>;
