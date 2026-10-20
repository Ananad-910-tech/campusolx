import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && key && !url.includes("YOUR_PROJECT"));
export const supabase = isSupabaseConfigured ? createClient(url, key) : null;

export const collegeEmailDomain = (import.meta.env.VITE_COLLEGE_EMAIL_DOMAIN || "")
  .trim()
  .toLowerCase()
  .replace(/^@/, "");

export function isAllowedCollegeEmail(email) {
  if (!collegeEmailDomain) return false;
  const normalized = (email || "").trim().toLowerCase();
  return normalized.endsWith(`@${collegeEmailDomain}`);
}
