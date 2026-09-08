import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type Category = {
  id: string;
  slug: string;
  name: string;
  icon_key: string;
  sort_order: number;
};

export type BookStatus = "available" | "unavailable" | "new" | "under_print";

export type Book = {
  id: string;
  slug: string;
  title: string;
  author: string;
  description: string;
  price: number | null;
  isbn: string | null;
  cover_url: string | null;
  status: string | null;
  is_featured: boolean;
  sort_order: number;
  category_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Branch = {
  id: string;
  name: string;
  address: string;
  phone: string;
  maps_url: string;
  hours: string;
  is_main: boolean;
  sort_order: number;
};

export type Faq = { id: string; question: string; answer: string; sort_order: number };

export type SiteData = {
  settings: Record<string, string>;
  categories: Category[];
  books: Book[];
  branches: Branch[];
  faqs: Faq[];
};

export function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const getSiteData = createServerFn({ method: "GET" }).handler(async (): Promise<SiteData> => {
  const supabase = publicClient();
  const [settingsRes, categoriesRes, booksRes, branchesRes, faqsRes] = await Promise.all([
    supabase.from("settings").select("key, value"),
    supabase.from("categories").select("id, slug, name, icon_key, sort_order").order("sort_order"),
    supabase
      .from("books")
      .select(
        "id, slug, title, author, description, price, isbn, cover_url, status, is_featured, sort_order, category_id, created_at, updated_at",
      )
      .eq("is_active", true)
      .order("sort_order")
      .limit(2000),
    supabase.from("branches").select("*").order("sort_order"),
    supabase.from("faqs").select("id, question, answer, sort_order").eq("is_active", true).order("sort_order"),
  ]);

  const settings: Record<string, string> = {};
  for (const row of settingsRes.data ?? []) settings[row.key] = row.value;

  return {
    settings,
    categories: (categoriesRes.data ?? []) as Category[],
    books: ((booksRes.data ?? []) as Book[]).map((b) => ({
      ...b,
      price: b.price === null || b.price === undefined ? null : Number(b.price),
    })),
    branches: (branchesRes.data ?? []) as Branch[],
    faqs: (faqsRes.data ?? []) as Faq[],
  };
});

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((input: { items: { title: string; qty: number; price: number }[]; total: number }) => {
    if (!Array.isArray(input?.items) || input.items.length === 0) throw new Error("سلة فارغة");
    return {
      items: input.items.slice(0, 100).map((i) => ({
        title: String(i.title).slice(0, 200),
        qty: Math.max(1, Math.min(999, Number(i.qty) || 1)),
        price: Math.max(0, Number(i.price) || 0),
      })),
      total: Math.max(0, Number(input.total) || 0),
    };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("orders").insert({ items: data.items, total: data.total });
    return { ok: true };
  });
