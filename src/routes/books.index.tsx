import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { BookCard } from "@/components/site/BookCard";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { categoryOf, coverFor, siteQueryOptions, SITE_NAME } from "@/lib/site";

export const Route = createFileRoute("/books/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(siteQueryOptions);
  },
  head: () => ({
    meta: [
      { title: `تصفح الكتب — ${SITE_NAME}` },
      { name: "description", content: "تصفح مجموعة كتب مكتبة دار الحكمة بالتصنيفات والأسعار بالدينار الليبي." },
      { property: "og:title", content: `تصفح الكتب — ${SITE_NAME}` },
      { property: "og:description", content: "تصفح مجموعة كتب مكتبة دار الحكمة بالتصنيفات والأسعار." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/books" },
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumbs items={[{ label: "الرئيسية", to: "/" }, { label: "الكتب" }]} />
      <h1 className="text-2xl font-bold md:text-3xl">تصفح الكتب</h1>
      <div className="gold-rule mt-3" />

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
        {site.books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            cover={coverFor(book, site.categories)}
            category={categoryOf(book, site.categories)?.name}
          />
        ))}
      </div>
    </div>
  );
}
