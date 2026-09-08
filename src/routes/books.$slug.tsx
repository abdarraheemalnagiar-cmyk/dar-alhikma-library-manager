import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { categoryOf, coverFor, formatPrice, siteQueryOptions, SITE_NAME } from "@/lib/site";

export const Route = createFileRoute("/books/$slug")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(siteQueryOptions);
  },
  head: ({ params }) => ({
    meta: [
      { title: `كتاب ${params.slug} — ${SITE_NAME}` },
      { name: "description", content: `تفاصيل الكتاب وسعره وتوفره في ${SITE_NAME}.` },
      { property: "og:title", content: `تفاصيل الكتاب — ${SITE_NAME}` },
      { property: "og:description", content: `تفاصيل الكتاب وسعره وتوفره في ${SITE_NAME}.` },
      { property: "og:type", content: "product" },
      { property: "og:url", content: `/books/${params.slug}` },
    ],
    links: [{ rel: "canonical", href: `/books/${params.slug}` }],
  }),
  component: BookDetail,
  errorComponent: () => <Message text="تعذّر تحميل بيانات الكتاب." />,
  notFoundComponent: () => <Message text="هذا الكتاب غير موجود." />,
});

function Message({ text }: { text: string }) {
  return <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">{text}</div>;
}

function BookDetail() {
  const { slug } = Route.useParams();
  const { data: site } = useSuspenseQuery(siteQueryOptions);
  const { add } = useCart();

  const book = site.books.find((b) => b.slug === slug);
  if (!book) throw notFound();

  const cover = coverFor(book, site.categories);
  const category = categoryOf(book, site.categories);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Breadcrumbs
        items={[
          { label: "الرئيسية", to: "/" },
          { label: "الكتب", to: "/books" },
          { label: book.title },
        ]}
      />

      <div className="grid gap-8 md:grid-cols-[280px_1fr]">
        <div className="surface-panel overflow-hidden">
          <img
            src={cover}
            alt={`غلاف كتاب ${book.title}${book.author ? ` للكاتب ${book.author}` : ""}`}
            width={683}
            height={1024}
            className="aspect-[2/3] w-full object-cover"
          />
        </div>

        <div>
          {category && <p className="text-xs text-muted-foreground">{category.name}</p>}
          <h1 className="mt-1 text-2xl font-bold md:text-3xl">{book.title}</h1>
          {book.author && <p className="mt-1 text-sm text-muted-foreground">{book.author}</p>}
          <div className="gold-rule mt-4" />
          <p className="mt-4 leading-8 text-muted-foreground">{book.description}</p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <span className="text-xl font-bold">{formatPrice(book.price)}</span>
            {!book.in_stock && (
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">غير متوفر حاليًا</span>
            )}
          </div>

          <Button
            className="mt-5"
            disabled={!book.in_stock}
            onClick={() => add({ id: book.id, slug: book.slug, title: book.title, price: book.price, cover })}
          >
            {book.in_stock ? "أضف إلى السلة" : "غير متوفر"}
          </Button>
        </div>
      </div>
    </div>
  );
}
