import { queryOptions } from "@tanstack/react-query";

import coverClassic from "@/assets/cover-classic.jpg";
import coverPhilosophy from "@/assets/cover-philosophy.jpg";
import coverFairy from "@/assets/cover-fairy.jpg";
import coverFantasy from "@/assets/cover-fantasy.jpg";
import coverSelfdev from "@/assets/cover-selfdev.jpg";
import coverRomance from "@/assets/cover-romance.jpg";
import coverManga from "@/assets/cover-manga.jpg";
import coverPuzzles from "@/assets/cover-puzzles.jpg";
import coverPsychology from "@/assets/cover-psychology.jpg";

import { getSiteData, type Book, type Category, type SiteData } from "./public.functions";

export const COVERS: Record<string, string> = {
  "cover-classic": coverClassic,
  "cover-philosophy": coverPhilosophy,
  "cover-fairy": coverFairy,
  "cover-fantasy": coverFantasy,
  "cover-selfdev": coverSelfdev,
  "cover-romance": coverRomance,
  "cover-manga": coverManga,
  "cover-puzzles": coverPuzzles,
  "cover-psychology": coverPsychology,
};

export const siteQueryOptions = queryOptions({
  queryKey: ["site-data"],
  queryFn: () => getSiteData(),
  staleTime: 30_000,
});

export function coverFor(book: Book, categories: Category[]): string {
  if (book.cover_url) return book.cover_url;
  const cat = categories.find((c) => c.id === book.category_id);
  return COVERS[cat?.cover_key ?? "cover-classic"] ?? coverClassic;
}

export function categoryOf(book: Book, categories: Category[]): Category | undefined {
  return categories.find((c) => c.id === book.category_id);
}

export function formatPrice(price: number): string {
  return `${Number(price).toLocaleString("ar-LY", { maximumFractionDigits: 2 })} د.ل`;
}

export function whatsappNumber(site: SiteData | undefined): string {
  return site?.settings["whatsapp"] || "218918127948";
}

export function phoneNumber(site: SiteData | undefined): string {
  return site?.settings["phone"] || "+218918127948";
}

export const SITE_NAME = "مكتبة دار الحكمة";
export const FOUNDED = "تأسست منذ 1990";

export type { Book, Category, SiteData };
