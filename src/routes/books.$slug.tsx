import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { BookCard } from "@/components/site/BookCard";
import { BookCover } from "@/components/site/BookCover";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { CategoryIcon } from "@/components/site/CategoryIcon";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import {
  categoryOf,
  coverFor,
  fallbackCover,
  formatPrice,
  isOrderable,
  siteQueryOptions,
  statusLabel,
  SITE_NAME,
} from "@/lib/site";

export const Route = createFileRoute("/books/$slug")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(siteQueryOptions);
  },
  head: ({ params }) => ({
    meta: [
      { title: `تفاصيل الكتاب — ${SITE_NAME}` },
      { name: "description", content: `وصف الكتاب وسعره وحالة توفره في ${SITE_NAME}.` },
      { property: "og:title", content: `تفاصيل الكتاب — ${SITE_NAME}` },
      { property: "og:description", content: `وصف الكتاب وسعره وحالة توفره في ${SITE_NAME}.` },
      { property: "og:type", content: "product" },
    ],
    links: [{ rel: "canonical", href: `/books/${params.slug}` }],
  }),
  component: BookDetail,
  errorComponent: () => <Message text="تعذّر تحميل بيانات الكتاب." />,
  notFoundComponent: () => <Message text="هذا الكتاب غير موجود." />,
});

function Message({ text }: { text: string }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">
      {text}
      <div className="mt-4">
        <Link to="/books" search={{}} className="text-gold hover:underline">
          العودة إلى الكتب
        </Link>
      </div>
    </div>
  );
}

function BookDetail() {
  const { slug } = Route.useParams();
  const { data: site } = useSuspenseQuery(siteQueryOptions);
  const { add } = useCart();

  const book = site.books.find((b) => b.slug === slug);
  if (!book) throw notFound();

  const category = categoryOf(book, site.categories);
  const cover = coverFor(book, site.categories);
  const orderable = isOrderable(book);
  const related = site.books
    .filter((b) => b.category_id === book.category_id && b.id !== book.id)
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumbs
        items={[
          { label: "الرئيسية", to: "/" },
          { label: "الكتب", to: "/books" },
          { label: book.title },
        ]}
      />

      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        <div className="surface-panel overflow-hidden">
          <BookCover
            src={cover}
            fallback={fallbackCover(book, site.categories)}
            alt={`غلاف كتاب ${book.title}`}
            className="aspect-[2/3] w-full object-cover"
          />
        </div>

        <div>
          {category && (
            <Link
              to="/books"
              search={{ cat: category.slug }}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold"
            >
              <CategoryIcon iconKey={category.icon_key} className="size-3.5" />
              {category.name}
            </Link>
          )}
          <h1 className="mt-2 text-2xl font-bold md:text-3xl">{book.title}</h1>
          {book.author && <p className="mt-2 text-sm text-muted-foreground">تأليف: {book.author}</p>}
          <div className="gold-rule mt-4" />

          <p className="mt-5 text-sm leading-8 text-muted-foreground">{book.description}</p>

          <dl className="mt-6 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
            <div className="flex gap-2">
              <dt className="font-semibold text-foreground">الحالة:</dt>
              <dd>{statusLabel(book.status)}</dd>
            </div>
            {book.isbn && (
              <div className="flex gap-2">
                <dt className="font-semibold text-foreground">الترقيم الدولي:</dt>
                <dd dir="ltr">{book.isbn}</dd>
              </div>
            )}
          </dl>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <span className="text-xl font-bold">{formatPrice(book.price)}</span>
            <Button
              size="lg"
              disabled={!orderable}
              onClick={() =>
                orderable &&
                add({
                  id: book.id,
                  slug: book.slug,
                  title: book.title,
                  price: book.price ?? 0,
                  cover,
                })
              }
            >
              {orderable ? "أضف إلى السلة" : statusLabel(book.status)}
            </Button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-lg font-bold">كتب من نفس القسم</h2>
          <div className="gold-rule mt-3" />
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
            {related.map((item) => (
              <BookCard
                key={item.id}
                book={item}
                cover={coverFor(item, site.categories)}
                fallback={fallbackCover(item, site.categories)}
                category={category?.name}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
