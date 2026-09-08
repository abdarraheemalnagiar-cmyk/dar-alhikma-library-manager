import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useMemo } from "react";

import { BookCard } from "@/components/site/BookCard";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { CategoryIcon } from "@/components/site/CategoryIcon";
import { Input } from "@/components/ui/input";
import {
  categoryOf,
  coverFor,
  fallbackCover,
  normalizeArabic,
  siteQueryOptions,
  SITE_NAME,
} from "@/lib/site";

type SortKey = "title" | "price-asc" | "price-desc" | "newest";

type BooksSearch = { q: string; cat: string; sort: SortKey; status: string };

export const Route = createFileRoute("/books/")({
  validateSearch: (search: Record<string, unknown>): BooksSearch => ({
    q: typeof search["q"] === "string" ? search["q"] : "",
    cat: typeof search["cat"] === "string" ? search["cat"] : "",
    status: typeof search["status"] === "string" ? search["status"] : "",
    sort: (["title", "price-asc", "price-desc", "newest"] as const).includes(search["sort"] as SortKey)
      ? (search["sort"] as SortKey)
      : "title",
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(siteQueryOptions);
  },
  head: () => ({
    meta: [
      { title: `تصفح الكتب — ${SITE_NAME}` },
      {
        name: "description",
        content: "تصفح كتب مكتبة دار الحكمة حسب القسم والسعر مع بحث عربي سريع بالعنوان أو المؤلف.",
      },
      { property: "og:title", content: `تصفح الكتب — ${SITE_NAME}` },
      { property: "og:description", content: "ابحث في مجموعة كتب دار الحكمة حسب القسم والسعر والحالة." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/books" }],
  }),
  component: BooksPage,
  errorComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">
      تعذّر تحميل الكتب حاليًا.
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">الصفحة غير موجودة.</div>
  ),
});

function BooksPage() {
  const { data: site } = useSuspenseQuery(siteQueryOptions);
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const setSearch = (patch: Partial<BooksSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  const books = useMemo(() => {
    const needle = normalizeArabic(search.q);
    const terms = needle ? needle.split(" ") : [];
    let list = site.books.filter((book) => {
      if (search.cat && categoryOf(book, site.categories)?.slug !== search.cat) return false;
      if (search.status && (book.status ?? "available") !== search.status) return false;
      if (terms.length === 0) return true;
      const haystack = normalizeArabic(
        `${book.title} ${book.author} ${book.description} ${book.isbn ?? ""}`,
      );
      return terms.every((term) => haystack.includes(term));
    });

    list = [...list].sort((a, b) => {
      switch (search.sort) {
        case "price-asc":
          return (a.price ?? Number.POSITIVE_INFINITY) - (b.price ?? Number.POSITIVE_INFINITY);
        case "price-desc":
          return (b.price ?? -1) - (a.price ?? -1);
        case "newest":
          return b.created_at.localeCompare(a.created_at);
        default:
          return a.title.localeCompare(b.title, "ar");
      }
    });
    return list;
  }, [site, search]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumbs items={[{ label: "الرئيسية", to: "/" }, { label: "الكتب" }]} />
      <h1 className="text-2xl font-bold md:text-3xl">تصفح الكتب</h1>
      <div className="gold-rule mt-3" />
      <p className="mt-3 text-sm text-muted-foreground">
        {site.books.length.toLocaleString("ar-LY")} عنوانًا في {site.categories.length.toLocaleString("ar-LY")}{" "}
        قسمًا
      </p>

      <div className="surface-panel mt-6 flex flex-col gap-3 p-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search.q}
            onChange={(e) => setSearch({ q: e.target.value })}
            placeholder="ابحث بالعنوان أو المؤلف أو الرقم الدولي"
            className="pr-9"
            aria-label="بحث في الكتب"
          />
        </div>
        <select
          value={search.status}
          onChange={(e) => setSearch({ status: e.target.value })}
          aria-label="الحالة"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">كل الحالات</option>
          <option value="available">متوفر</option>
          <option value="new">صدر حديثًا</option>
          <option value="under_print">تحت الطبع</option>
          <option value="unavailable">غير متوفر</option>
        </select>
        <select
          value={search.sort}
          onChange={(e) => setSearch({ sort: e.target.value as SortKey })}
          aria-label="الترتيب"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="title">ترتيب أبجدي</option>
          <option value="price-asc">السعر: الأقل أولًا</option>
          <option value="price-desc">السعر: الأعلى أولًا</option>
          <option value="newest">الأحدث إضافة</option>
        </select>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setSearch({ cat: "" })}
          className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
            search.cat === "" ? "border-gold text-gold" : "border-border hover:border-gold"
          }`}
        >
          كل الأقسام
        </button>
        {site.categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSearch({ cat: c.slug })}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
              search.cat === c.slug ? "border-gold text-gold" : "border-border hover:border-gold"
            }`}
          >
            <CategoryIcon iconKey={c.icon_key} className="size-3.5" />
            {c.name}
          </button>
        ))}
      </div>

      {books.length === 0 ? (
        <div className="surface-panel mt-10 p-10 text-center text-sm text-muted-foreground">
          لا توجد كتب مطابقة لبحثك.
          <div className="mt-3">
            <Link to="/books" search={{ q: "", cat: "", sort: "title", status: "" }} className="text-gold hover:underline">
              إعادة ضبط البحث
            </Link>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-6 text-xs text-muted-foreground">النتائج: {books.length.toLocaleString("ar-LY")}</p>
          <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                cover={coverFor(book, site.categories)}
                fallback={fallbackCover(book, site.categories)}
                category={categoryOf(book, site.categories)?.name}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
