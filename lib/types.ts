export type Category = "education" | "healthcare" | "community" | "innovation";

export type EventCategory =
  | "Schools"
  | "Colleges"
  | "University"
  | "Healthcare"
  | "Alumni"
  | "Community"
  | "Sports"
  | "Cultural"
  | "Conferences";

export interface Institution {
  id: string;
  name: string;
  location: string;
  city: string;
  established_year: number | null;
  category: Category;
  description: string;
  external_url: string;
  logo_url: string | null;
  latitude: number | null;
  longitude: number | null;
  /** Governing trust / foundation, per the official directory. */
  parent_org: string;
  sort_order: number;
}

export interface CrescentEvent {
  id: string;
  title: string;
  date_start: string; // ISO date
  date_end: string | null;
  institution_id: string | null;
  institution_name: string;
  category: EventCategory;
  location: string;
  description: string;
  is_featured: boolean;
  image_url: string | null;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  institution_id: string | null;
  institution_name: string;
  published_at: string; // ISO date
  image_url: string | null;
}

export interface TimelineEntry {
  year: number;
  title: string;
  description: string;
}
