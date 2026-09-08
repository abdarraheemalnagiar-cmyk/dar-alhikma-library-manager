import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Phone } from "lucide-react";

import { CartSheet } from "@/components/site/CartSheet";
import { phoneNumber, siteQueryOptions, SITE_NAME } from "@/lib/site";

export function AnnouncementBar() {
  const { data: site } = useSuspenseQuery(siteQueryOptions);
  if (site.settings["announcement_enabled"] !== "true") return null;
  return (
    <div className="bg-primary px-4 py-2 text-center text-xs font-medium text-primary-foreground md:text-sm">
      {site.settings["announcement_text"] || "أهلاً بكم في مكتبة دار الحكمة"}
    </div>
  );
}

export function Header() {
  const { data: site } = useSuspenseQuery(siteQueryOptions);
  const phone = phoneNumber(site);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt={SITE_NAME} className="size-10 rounded-full object-cover" />
          <span className="leading-tight">
            <span className="block text-sm font-bold md:text-base">{SITE_NAME}</span>
            <span className="block text-[11px] text-muted-foreground">تأسست منذ 1990</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link to="/" className="transition-colors hover:text-gold">
            الرئيسية
          </Link>
          <Link to="/books" className="transition-colors hover:text-gold">
            الكتب
          </Link>
          <a href="/#about" className="transition-colors hover:text-gold">
            من نحن
          </a>
          <a href="/#branches" className="transition-colors hover:text-gold">
            الفروع
          </a>
          <a href="/#faq" className="transition-colors hover:text-gold">
            الأسئلة الشائعة
          </a>
        </nav>

        <div className="flex items-center gap-1">
          <a
            href={`tel:${phone}`}
            className="hidden items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs transition-colors hover:border-gold sm:flex"
            dir="ltr"
          >
            <Phone className="size-3.5" />
            {phone}
          </a>
          <CartSheet />
        </div>
      </div>
    </header>
  );
}
