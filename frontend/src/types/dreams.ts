export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Country {
  id: number;
  name: string;
}

export interface City {
  id: number;
  name: string;
  country: {
    id: number;
    name: string;
  };
}

export interface Dream {
  id: number;
  owner: number;
  title: string;
  to_another: boolean;
  dreamer: number;
  categories: number[];
  content: string;
  goal: string;
  photo_url: string | null;
  thumbnail_url: string | null;
  status: string;
  created_at: string;
  number_donations: number;
  total_amount_donations: number;
  number_comments: number;
  number_views: number;
  level_completed: number;
  completed_at: string | null;
}

export interface DreamResponse {
  count: number;
  num_pages: number;
  next: string | null;
  previous: string | null;
  allowed_page_sizes: number[];
  results: Dream[];
}

export interface FundingRange {
  id: number;
  label: string;
  minValue: number | null;
  maxValue: number | null;
}

export interface SortOption {
  id: number;
  label: string;
  field: string;
  direction: 'asc' | 'desc' | string;
}
