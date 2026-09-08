import { useSuspenseQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";

import { siteQueryOptions, whatsappNumber } from "@/lib/site";

export function WhatsappFloat() {
  const { data: site } = useSuspenseQuery(siteQueryOptions);

  return (
    <a
      href={`https://wa.me/${whatsappNumber(site)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل معنا عبر واتساب"
      className="fixed bottom-5 left-5 z-50 inline-flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lift transition-transform duration-300 hover:scale-105"
    >
      <MessageCircle className="size-6" />
    </a>
  );
}
