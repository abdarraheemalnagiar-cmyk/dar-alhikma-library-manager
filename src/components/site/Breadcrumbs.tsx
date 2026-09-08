import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

export type Crumb = { label: string; to?: string; params?: Record<string, string> };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="مسار التنقل" className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
          {index > 0 && <ChevronLeft className="size-3" />}
          {item.to ? (
            <Link
              to={item.to}
              params={item.params as never}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
