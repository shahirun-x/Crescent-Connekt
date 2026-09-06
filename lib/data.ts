import { getSupabase } from "./supabase";
import { EVENTS, INSTITUTIONS, NEWS, TIMELINE } from "./seed";
import type { CrescentEvent, Institution, NewsItem, TimelineEntry } from "./types";

/**
 * Data-access layer. Every function tries Supabase first and transparently falls
 * back to the bundled seed data if Supabase is not configured or the query fails.
 * A warning is logged on fallback so we know if the live connection breaks.
 */

function warnFallback(table: string, error?: unknown) {
  const msg = error instanceof Error ? error.message : String(error ?? "");
  console.warn(
    `[data] Falling back to seed data for "${table}"${msg ? `: ${msg}` : ""}`
  );
}

export async function getInstitutions(): Promise<Institution[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("institutions")
        .select("*")
        .order("sort_order", { ascending: true });
      if (!error && data && data.length) return data as Institution[];
      if (error) warnFallback("institutions", error);
    } catch (e) {
      warnFallback("institutions", e);
    }
  }
  return [...INSTITUTIONS].sort((a, b) => a.sort_order - b.sort_order);
}

export async function getInstitutionMap(): Promise<Map<string, Institution>> {
  const list = await getInstitutions();
  return new Map(list.map((i) => [i.id, i]));
}

export async function getEvents(): Promise<CrescentEvent[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("events")
        .select(
          "id, title, date_start, date_end, institution_id, category, location, description, is_featured, image_url, institutions(name)"
        )
        .order("date_start", { ascending: true });
      if (!error && data && data.length) {
        return (data as unknown as RawEvent[]).map((row) => ({
          id: row.id,
          title: row.title,
          date_start: row.date_start,
          date_end: row.date_end,
          institution_id: row.institution_id,
          institution_name: row.institutions?.name ?? "Crescent Network",
          category: row.category,
          location: row.location,
          description: row.description,
          is_featured: row.is_featured,
          image_url: row.image_url ?? null,
        }));
      }
      if (error) warnFallback("events", error);
    } catch (e) {
      warnFallback("events", e);
    }
  }
  return [...EVENTS].sort((a, b) => a.date_start.localeCompare(b.date_start));
}

export async function getNews(): Promise<NewsItem[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("news")
        .select(
          "id, title, summary, content, institution_id, published_at, image_url, institutions(name)"
        )
        .order("published_at", { ascending: false });
      if (!error && data && data.length) {
        return (data as unknown as RawNews[]).map((row) => ({
          id: row.id,
          title: row.title,
          summary: row.summary,
          content: row.content,
          institution_id: row.institution_id,
          institution_name: row.institutions?.name ?? "Crescent Network",
          published_at: row.published_at,
          image_url: row.image_url,
        }));
      }
      if (error) warnFallback("news", error);
    } catch (e) {
      warnFallback("news", e);
    }
  }
  return [...NEWS].sort((a, b) => b.published_at.localeCompare(a.published_at));
}

export async function getTimeline(): Promise<TimelineEntry[]> {
  return [...TIMELINE].sort((a, b) => a.year - b.year);
}

interface RawEvent {
  id: string;
  title: string;
  date_start: string;
  date_end: string | null;
  institution_id: string | null;
  category: CrescentEvent["category"];
  location: string;
  description: string;
  is_featured: boolean;
  image_url: string | null;
  institutions: { name: string } | null;
}

interface RawNews {
  id: string;
  title: string;
  summary: string;
  content: string;
  institution_id: string | null;
  published_at: string;
  image_url: string | null;
  institutions: { name: string } | null;
}
