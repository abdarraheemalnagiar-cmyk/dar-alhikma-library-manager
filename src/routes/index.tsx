import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { BookOpen, MapPin, ShieldCheck, Truck } from "lucide-react";

import heroImage from "@/assets/hero-library.jpg";
import { BookCard } from "@/components/site/BookCard";
import { CategoryIcon } from "@/components/site/CategoryIcon";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  categoryOf,
  coverFor,
  fallbackCover,
  siteQueryOptions,
  SITE_NAME,
  FOUNDED,
  type Book,
  type SiteData,
} from "@/lib/site";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(siteQueryOptions);
  },
  head: () => ({
    meta: [
      { title: `${SITE_NAME} — كتب أكاديمية وعامة منذ 1990` },
      {
        name: "description",
        content:
          "مكتبة دار الحكمة: مئات العناوين في القانون والحاسوب والهندسة والعلوم والأدب والدراسات الإسلامية، مع طلب سريع عبر واتساب.",
      },
      { property: "og:title", content: `${SITE_NAME} — كتب أكاديمية وعامة منذ 1990` },
      {
        property: "og:description",
        content: "تصفح مجموعتنا حسب الأقسام واطلب كتابك عبر واتساب من أقرب فرع لك.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Home,
  errorComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">
      تعذّر تحميل الصفحة حاليًا، حاول التحديث.
    </div>
  ),
});

function Home() {
  const { data: site } = useSuspenseQuery(siteQueryOptions);
  const featured = site.books.filter((b) => b.is_featured).slice(0, 10);
  const newArrivals = site.books.filter((b) => b.status === "new").slice(0, 10);
  const count = site.books.length.toLocaleString("ar-LY");
  const catCount = site.categories.length.toLocaleString("ar-LY");

  const why = [
    { icon: BookOpen, title: "تشكيلة واسعة", text: `${count} عنوانًا موزعة على ${catCount} قسمًا.` },
    { icon: ShieldCheck, title: "نسخ أصلية", text: "طبعات مضمونة الجودة ننتقيها بعناية منذ 1990." },
    { icon: Truck, title: "طلب سريع", text: "أرسل سلتك عبر واتساب ونجهّز طلبك في الحال." },
    { icon: MapPin, title: "فروع قريبة منك", text: "خدمة من الفرع مع إمكانية الاستلام مباشرة." },
  ];

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <img
          src={heroImage}
          alt="رفوف مكتبة دار الحكمة المليئة بالكتب"
          width={1600}
          height={1000}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/75" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center text-primary-foreground md:py-32">
          <h1 className="text-3xl font-bold md:text-5xl">{SITE_NAME}</h1>
          <p className="mt-3 text-sm text-primary-foreground/85 md:text-base">{FOUNDED}</p>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-primary-foreground/90 md:text-base">
            {count} عنوانًا في القانون والحاسوب والهندسة والعلوم والأدب والدراسات الإسلامية — اختر كتابك
            وأرسل طلبك عبر واتساب.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/books" search={{}}>
                تصفح الكتب
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a href="#branches">فروعنا</a>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-xl font-bold md:text-2xl">الأقسام</h2>
        <div className="gold-rule mt-3" />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {site.categories.map((c) => {
            const total = site.books.filter((b) => b.category_id === c.id).length;
            return (
              <Link
                key={c.id}
                to="/books"
                search={{ cat: c.slug }}
                className="surface-panel flex items-center gap-3 p-3.5 transition-colors hover:border-gold"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-gold">
                  <CategoryIcon iconKey={c.icon_key} className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold">{c.name}</span>
                  <span className="block text-[11px] text-muted-foreground">
                    {total.toLocaleString("ar-LY")} كتابًا
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {featured.length > 0 && (
        <BookSection id="featured" title="مختارات المكتبة" books={featured} site={site} />
      )}
      {newArrivals.length > 0 && (
        <BookSection id="new" title="صدر حديثًا" books={newArrivals} site={site} />
      )}

      <section className="bg-secondary/50 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-xl font-bold md:text-2xl">لماذا دار الحكمة؟</h2>
          <div className="gold-rule mt-3" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {why.map((w) => (
              <div key={w.title} className="surface-panel p-5">
                <w.icon className="size-6 text-gold" />
                <h3 className="mt-3 text-sm font-semibold">{w.title}</h3>
                <p className="mt-1 text-xs leading-6 text-muted-foreground">{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-14 text-center">
        <h2 className="text-xl font-bold md:text-2xl">من نحن</h2>
        <div className="gold-rule mx-auto mt-3" />
        <p className="mt-6 text-sm leading-8 text-muted-foreground">{site.settings["about_text"]}</p>
        <p className="mt-4 text-sm font-semibold">{FOUNDED}</p>
      </section>

      <section id="branches" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-14">
        <h2 className="text-xl font-bold md:text-2xl">فروعنا</h2>
        <div className="gold-rule mt-3" />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {site.branches.map((b) => (
            <div key={b.id} className="surface-panel p-5">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">{b.name}</h3>
                {b.is_main && (
                  <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-semibold text-gold-foreground">
                    الفرع الرئيسي
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{b.address}</p>
              <p className="mt-1 text-xs text-muted-foreground">{b.hours}</p>
              <div className="mt-3 flex gap-3 text-xs">
                <a href={`tel:${b.phone}`} dir="ltr" className="text-gold hover:underline">
                  {b.phone}
                </a>
                {b.maps_url && (
                  <a
                    href={b.maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold hover:underline"
                  >
                    الموقع على الخريطة
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {site.faqs.length > 0 && (
        <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-14">
          <h2 className="text-xl font-bold md:text-2xl">الأسئلة الشائعة</h2>
          <div className="gold-rule mt-3" />
          <Accordion type="single" collapsible className="mt-6">
            {site.faqs.map((f) => (
              <AccordionItem key={f.id} value={f.id}>
                <AccordionTrigger className="text-right text-sm">{f.question}</AccordionTrigger>
                <AccordionContent className="text-sm leading-7 text-muted-foreground">
                  {f.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      )}
    </div>
  );
}

function BookSection({
  id,
  title,
  books,
  site,
}: {
  id: string;
  title: string;
  books: Book[];
  site: SiteData;
}) {
  return (
    <section id={id} className="mx-auto max-w-6xl scroll-mt-24 px-4 py-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-xl font-bold md:text-2xl">{title}</h2>
          <div className="gold-rule mt-3" />
        </div>
        <Link to="/books" search={{}} className="text-xs text-gold hover:underline">
          عرض الكل
        </Link>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
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
    </section>
  );
}
