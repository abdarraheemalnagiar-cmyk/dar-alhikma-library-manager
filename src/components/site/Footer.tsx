import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Facebook, Mail, MapPin, Phone } from "lucide-react";

import { phoneNumber, siteQueryOptions, SITE_NAME } from "@/lib/site";

const FACEBOOK = "https://www.facebook.com/profile.php?id=100063840796435";
const EMAIL = "daralhikma123@gmail.com";

export function Footer() {
  const { data: site } = useSuspenseQuery(siteQueryOptions);
  const phone = phoneNumber(site);

  return (
    <footer className="mt-20 border-t border-border bg-secondary/50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt={SITE_NAME} className="size-9 rounded-full object-cover" />
            <span className="text-sm font-bold">{SITE_NAME}</span>
          </div>
          <p className="mt-3 text-xs leading-6 text-muted-foreground">
            مكتبة عريقة تأسست منذ 1990، نوفّر لكم أجود الكتب العربية والمترجمة بأسعار مناسبة.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold">روابط سريعة</h3>
          <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
            <li>
              <Link to="/" className="transition-colors hover:text-gold">
                الرئيسية
              </Link>
            </li>
            <li>
              <Link to="/books" className="transition-colors hover:text-gold">
                تصفح الكتب
              </Link>
            </li>
            <li>
              <a href="/#about" className="transition-colors hover:text-gold">
                من نحن
              </a>
            </li>
            <li>
              <a href="/#faq" className="transition-colors hover:text-gold">
                الأسئلة الشائعة
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">تواصل معنا</h3>
          <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
            <li>
              <a href={`tel:${phone}`} className="flex items-center gap-2 hover:text-gold" dir="ltr">
                <Phone className="size-3.5" /> {phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${EMAIL}`} className="flex items-center gap-2 hover:text-gold">
                <Mail className="size-3.5" /> {EMAIL}
              </a>
            </li>
            <li>
              <a
                href={FACEBOOK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-gold"
              >
                <Facebook className="size-3.5" /> صفحتنا على فيسبوك
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">فروعنا</h3>
          <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
            {site.branches.map((b) => (
              <li key={b.id} className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-3.5 shrink-0" />
                <span>
                  <span className="font-medium text-foreground">{b.name}</span> — {b.address}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border py-4 text-center text-[11px] text-muted-foreground">
        © دار الحكمة 1990 — جميع الحقوق محفوظة
      </div>
    </footer>
  );
}
