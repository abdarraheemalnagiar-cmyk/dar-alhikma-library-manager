import { queryOptions } from "@tanstack/react-query";

import { generatedCover } from "./covers";
import { getSiteData, type Book, type Category, type SiteData } from "./public.functions";

export const siteQueryOptions = queryOptions({
  queryKey: ["site-data"],
  queryFn: () => getSiteData(),
  staleTime: 30_000,
});

export function categoryOf(book: Book, categories: Category[]): Category | undefined {
  return categories.find((c) => c.id === book.category_id);
}

/** Real uploaded cover when present, otherwise a unified house-style cover. */
export function coverFor(book: Book, categories: Category[]): string {
  if (book.cover_url) return book.cover_url;
  return fallbackCover(book, categories);
}

export function fallbackCover(book: Book, categories: Category[]): string {
  const cat = categoryOf(book, categories);
  return generatedCover({
    title: book.title,
    author: book.author,
    categorySlug: cat?.slug ?? null,
    categoryName: cat?.name ?? null,
  });
}

export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) return "السعر عند الطلب";
  return `${Number(price).toLocaleString("ar-LY", { maximumFractionDigits: 2 })} د.ل`;
}

export const STATUS_LABELS: Record<string, string> = {
  available: "متوفر",
  unavailable: "غير متوفر حاليًا",
  new: "صدر حديثًا",
  under_print: "تحت الطبع",
};

export function statusLabel(status: string | null | undefined): string {
  return STATUS_LABELS[status ?? "available"] ?? "متوفر";
}

export function isOrderable(book: Book): boolean {
  return book.price !== null && book.status !== "unavailable" && book.status !== "under_print";
}

/** Arabic-friendly normalization: strips diacritics/tatweel and unifies letters. */
export function normalizeArabic(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
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
