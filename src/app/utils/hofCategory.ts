export const HOF_CATEGORY_KEY_MAP: Record<string, string> = {
  "top 5 commission": "Top 5 Commission",
  "top commission": "Top 5 Commission",
  "commission": "Top 5 Commission",

  "top 5 by unit": "Top 5 By Unit",
  "top 5 unit": "Top 5 By Unit",
  "top unit": "Top 5 By Unit",
  "unit": "Top 5 By Unit",

  "top 5 primary": "Top 5 Primary",
  "top primary": "Top 5 Primary",
  "top primary kpr": "Top 5 Primary",
  "top primary and kpr": "Top 5 Primary",
  "top primary  kpr": "Top 5 Primary",
  "primary kpr": "Top 5 Primary",

  "rising star": "Rising Star",

  "content creator": "Content Creator",
  "top content creator": "Content Creator",

  "listing hunter": "Listing Hunter",
  "top listing": "Listing Hunter",

  "prospecting master": "Prospecting Master",
  "top prospecting": "Prospecting Master",

  "top recruiter": "Top Recruiter",
  "top recruit": "Top Recruiter",
};

export function normalizeHofCategory(rawCategory: string, allowedTabs: readonly string[]): string {
  const raw = (rawCategory || "").trim();
  if (!raw) return "";

  if (allowedTabs.includes(raw)) {
    return raw;
  }

  const key = raw
    .toLowerCase()
    .replace(/[_-]/g, " ")
    .replace(/&/g, " and ")
    .replace(/\s+/g, " ")
    .trim();

  return HOF_CATEGORY_KEY_MAP[key] || raw;
}