import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { BookOpen, MapPin, Quote, ShieldCheck, Star, Truck } from "lucide-react";

import heroImage from "@/assets/hero-library.jpg";
import { BookCard } from "@/components/site/BookCard";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { categoryOf, coverFor, siteQueryOptions, SITE_NAME, FOUNDED, type Book, type SiteData } from "@/lib/site";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(siteQueryOptions);
  },
  head: () => ({
    meta: [
      { title: `${SITE_NAME} — كتب عربية ومترجمة منذ 1990` },
      {
        name: "description",
        content:
          "مكتبة دار الحكمة: أكثر من 90 كتابًا في الأدب والفلسفة وتطوير الذات والمانغا، بأسعار بالدينار الليبي وطلب سريع عبر واتساب.",
      },
      { property: "og:title", content: `${SITE_NAME} — كتب عربية ومترجمة منذ 1990` },
      {
        property: "og:description",
        content: "تصفح مجموعتنا واطلب كتابك عبر واتساب من أقرب فرع لك.",
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

const WHY = [
  { icon: BookOpen, title: "تشكيلة واسعة", text: "أكثر من 90 عنوانًا في الأدب والفلسفة وتطوير الذات والمانغا." },
  { icon: ShieldCheck, title: "نسخ أصلية", text: "طبعات مضمونة الجودة ننتقيها بعناية منذ 1990." },
  { icon: Truck, title: "طلب سريع", text: "أرسل سلتك عبر واتساب ونجهّز طلبك في الحال." },
  { icon: MapPin, title: "فروع قريبة منك", text: "عدة فروع لخدمتك مع إمكانية الاستلام من الفرع." },
];

function Home() {
  const { data: site } = useSuspenseQuery(siteQueryOptions);
  const bestsellers = site.books.filter((b) => b.is_bestseller).slice(0, 10);
  const newArrivals = site.books.filter((b) => b.is_new).slice(0, 10);

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
        <div className="relative mx-auto max-w-6xl px-4 py-24 text-center text-primary-foreground md:py-32">
          <h1 className="text-3xl font-bold md:text-5xl">{SITE_NAME}</h1>
          <p className="mt-3 text-sm text-primary-foreground/85 md:text-base">{FOUNDED}</p>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-primary-foreground/90 md:text-base">
            رفوفنا مليئة بالأدب الكلاسيكي والفلسفة وتطوير الذات والمانغا — اختر كتابك وأرسل طلبك عبر
            واتساب.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/books">تصفح الكتب</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a href="#branches">فروعنا</a>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-xl font-bold md:text-2xl">التصنيفات</h2>
        <div className="gold-rule mt-3" />
        <div className="mt-6 flex flex-wrap gap-2">
          {site.categories.map((c) => (
            <Link
              key={c.id}
              to="/books"
              className="rounded-full border border-border bg-card px-4 py-2 text-xs transition-colors hover:border-gold hover:text-gold"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {bestsellers.length > 0 && (
        <BookSection id="bestsellers" title="الأكثر مبيعًا" books={bestsellers} site={site} />
      )}
      {newArrivals.length > 0 && (
        <BookSection id="new" title="وصل حديثًا" books={newArrivals} site={site} />
      )}

      <section className="bg-secondary/50 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-xl font-bold md:text-2xl">لماذا دار الحكمة؟</h2>
          <div className="gold-rule mt-3" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map((w) => (
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
        <p className="mt-6 text-sm leading-8 text-muted-foreground">
          {site.settings["about_text"] ||
            "بدأت مكتبة دار الحكمة عام 1990 من رفٍّ صغير وحلمٍ كبير: أن يجد كل قارئ كتابه. ومع مرور السنوات كبرت المكتبة وتعدّدت فروعها، لكن بقيت الفكرة نفسها — كتب مختارة بعناية، أسعار في متناول الجميع، ونصيحة صادقة لكل زائر."}
        </p>
        <p className="mt-4 text-sm font-semibold">{FOUNDED}</p>
      </section>

      {site.testimonials.length > 0 && (
        <section className="bg-secondary/50 py-14">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-xl font-bold md:text-2xl">آراء عملائنا</h2>
            <div className="gold-rule mt-3" />
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {site.testimonials.map((t) => (
                <figure key={t.id} className="surface-panel p-5">
                  <Quote className="size-5 text-gold" />
                  <blockquote className="mt-3 text-sm leading-7 text-muted-foreground">
                    {t.comment}
                  </blockquote>
                  <figcaption className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-semibold">{t.name}</span>
                    <span className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="size-3.5 fill-gold text-gold" />
                      ))}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

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
        <Link to="/books" className="text-xs text-gold hover:underline">
          عرض الكل
        </Link>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            cover={coverFor(book, site.categories)}
            category={categoryOf(book, site.categories)?.name}
          />
        ))}
      </div>
    </section>
  );
}
