import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { formatPrice, type Book } from "@/lib/site";

export function BookCard({ book, cover, category }: { book: Book; cover: string; category?: string | undefined }) {
  const { add } = useCart();

  return (
    <article className="book-card surface-panel flex h-full flex-col overflow-hidden">
      <Link to="/books/$slug" params={{ slug: book.slug }} className="block">
        <div className="relative aspect-[2/3] overflow-hidden bg-muted">
          <img
            src={cover}
            alt={`غلاف كتاب ${book.title}${book.author ? ` للكاتب ${book.author}` : ""}`}
            loading="lazy"
            width={683}
            height={1024}
            className="size-full object-cover transition-transform duration-500 hover:scale-[1.03]"
          />
          {!book.in_stock && (
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/55">
              <span className="rounded-full bg-background px-3 py-1 text-xs font-semibold">
                غير متوفر حاليًا
              </span>
            </div>
          )}
          {book.in_stock && book.is_new && (
            <span className="absolute top-2 right-2 rounded-full bg-gold px-2.5 py-0.5 text-[11px] font-semibold text-gold-foreground">
              وصل حديثًا
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-3.5">
        {category && <p className="text-[11px] text-muted-foreground">{category}</p>}
        <Link
          to="/books/$slug"
          params={{ slug: book.slug }}
          className="text-sm font-semibold leading-6 transition-colors hover:text-gold"
        >
          {book.title}
        </Link>
        {book.author && <p className="text-xs text-muted-foreground">{book.author}</p>}
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-sm font-bold">{formatPrice(book.price)}</span>
          <Button
            size="sm"
            disabled={!book.in_stock}
            onClick={() => add({ id: book.id, slug: book.slug, title: book.title, price: book.price, cover })}
          >
            {book.in_stock ? "أضف إلى السلة" : "غير متوفر"}
          </Button>
        </div>
      </div>
    </article>
  );
}

export function BookCardSkeleton() {
  return (
    <div className="surface-panel overflow-hidden">
      <div className="aspect-[2/3] animate-pulse bg-muted" />
      <div className="space-y-2 p-3.5">
        <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-8 w-full animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
