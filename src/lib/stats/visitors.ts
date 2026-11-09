import { createServiceRoleClient } from "@/lib/supabase/service-role";

const BUCKET_NAME = "site_metrics";
const FILE_NAME = "visitor_stats.json";
const BASELINE_TOTAL_VISITORS = 1240;

interface VisitorStats {
  totalVisitors: number;
  lastUpdated: string;
}

// In-memory cache for fast responses
let cachedStats: VisitorStats | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 5000; // 5 seconds

// Ensure bucket exists helper
let bucketEnsured = false;
async function ensureBucket() {
  if (bucketEnsured) return;
  try {
    const supabase = createServiceRoleClient();
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.some((b) => b.name === BUCKET_NAME)) {
      await supabase.storage.createBucket(BUCKET_NAME, { public: false });
    }
    bucketEnsured = true;
  } catch (err) {
    console.error("Failed to ensure site_metrics bucket:", err);
  }
}

export async function getLiveTotalVisitors(isNewVisitor = false): Promise<number> {
  const now = Date.now();

  // If cache is stale or empty, fetch from Supabase Storage
  if (!cachedStats || now - lastFetchTime > CACHE_TTL_MS) {
    try {
      await ensureBucket();
      const supabase = createServiceRoleClient();
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .download(FILE_NAME);

      if (!error && data) {
        const text = await data.text();
        const parsed = JSON.parse(text) as VisitorStats;
        if (typeof parsed?.totalVisitors === "number") {
          cachedStats = parsed;
        }
      } else {
        cachedStats = {
          totalVisitors: BASELINE_TOTAL_VISITORS,
          lastUpdated: new Date().toISOString(),
        };
        await supabase.storage
          .from(BUCKET_NAME)
          .upload(FILE_NAME, JSON.stringify(cachedStats), {
            contentType: "application/json",
            upsert: true,
          });
      }
    } catch (err) {
      console.error("Error loading visitor stats from storage:", err);
      if (!cachedStats) {
        cachedStats = {
          totalVisitors: BASELINE_TOTAL_VISITORS,
          lastUpdated: new Date().toISOString(),
        };
      }
    }
    lastFetchTime = now;
  }

  // If this is a new visitor, increment count and persist
  if (isNewVisitor && cachedStats) {
    cachedStats.totalVisitors += 1;
    cachedStats.lastUpdated = new Date().toISOString();

    try {
      const supabase = createServiceRoleClient();
      supabase.storage
        .from(BUCKET_NAME)
        .upload(FILE_NAME, JSON.stringify(cachedStats), {
          contentType: "application/json",
          upsert: true,
        })
        .catch((err) => console.error("Error persisting visitor stats:", err));
    } catch (err) {
      console.error("Error scheduling visitor stats save:", err);
    }
  }

  return cachedStats?.totalVisitors ?? BASELINE_TOTAL_VISITORS;
}
