import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type Category = {
  id: string;
  slug: string;
  name: string;
  cover_key: string;
  sort_order: number;
};

export type Book = {
  id: string;
  slug: string;
  title: string;
  author: string;
  description: string;
  rating: string;
  price: number;
  cover_url: string | null;
  in_stock: boolean;
  is_bestseller: boolean;
  is_new: boolean;
  sort_order: number;
  category_id: string | null;
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

export type Testimonial = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  sort_order: number;
};

export type Faq = { id: string; question: string; answer: string; sort_order: number };

export type SiteData = {
  settings: Record<string, string>;
  categories: Category[];
  books: Book[];
  branches: Branch[];
  testimonials: Testimonial[];
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
  const [settingsRes, categoriesRes, booksRes, branchesRes, testimonialsRes, faqsRes] =
    await Promise.all([
      supabase.from("settings").select("key, value"),
      supabase.from("categories").select("id, slug, name, cover_key, sort_order").order("sort_order"),
      supabase
        .from("books")
        .select(
          "id, slug, title, author, description, rating, price, cover_url, in_stock, is_bestseller, is_new, sort_order, category_id",
        )
        .order("sort_order"),
      supabase.from("branches").select("*").order("sort_order"),
      supabase.from("testimonials").select("id, name, rating, comment, sort_order").order("sort_order"),
      supabase.from("faqs").select("id, question, answer, sort_order").order("sort_order"),
    ]);

  const settings: Record<string, string> = {};
  for (const row of settingsRes.data ?? []) settings[row.key] = row.value;

  return {
    settings,
    categories: (categoriesRes.data ?? []) as Category[],
    books: ((booksRes.data ?? []) as Book[]).map((b) => ({ ...b, price: Number(b.price) })),
    branches: (branchesRes.data ?? []) as Branch[],
    testimonials: (testimonialsRes.data ?? []) as Testimonial[],
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
