export interface ComparisonTable {
  headers: string[];
  rows: string[][];
}

export interface BestForBadge {
  label: string;
  winner: string;
}

export interface SourceLink {
  title: string;
  url: string;
}

export interface ComparisonResponse {
  title: string;
  table: ComparisonTable;
  bestOverall: string;
  bestFor: BestForBadge[];
  importantDifferences: string[];
  missingInformation: string[];
  sourceLinks: SourceLink[];
}

export interface CompareRequestPayload {
  pages: Array<{
    title: string;
    url: string;
    content: string;
  }>;
  userPriority?: string | null;
}
