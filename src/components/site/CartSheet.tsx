import { useState } from "react";
import { ShoppingBag, Trash2, Minus, Plus } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCart, buildWhatsappMessage } from "@/lib/cart";
import { formatPrice, siteQueryOptions, whatsappNumber } from "@/lib/site";
import { placeOrder } from "@/lib/public.functions";

export function CartSheet() {
  const [open, setOpen] = useState(false);
  const { items, count, total, setQty, remove, clear } = useCart();
  const { data: site } = useSuspenseQuery(siteQueryOptions);
  const wa = whatsappNumber(site);

  const checkout = () => {
    const message = buildWhatsappMessage(items, total);
    void placeOrder({ data: { items: items.map((i) => ({ title: i.title, qty: i.qty, price: i.price })), total } }).catch(
      () => undefined,
    );
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="سلة المشتريات">
          <ShoppingBag className="size-5" />
          {count > 0 && (
            <span className="absolute -top-1 -left-1 flex size-5 items-center justify-center rounded-full bg-gold text-[11px] font-bold text-gold-foreground">
              {count}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>سلة المشتريات</SheetTitle>
          <SheetDescription>راجع كتبك ثم أتمم الطلب عبر واتساب.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-3 overflow-y-auto px-4">
          {items.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">السلة فارغة حاليًا.</p>
          )}
          {items.map((item) => (
            <div key={item.id} className="surface-panel flex gap-3 p-3">
              <img
                src={item.cover}
                alt={`غلاف كتاب ${item.title}`}
                loading="lazy"
                width={60}
                height={90}
                className="h-[90px] w-[60px] rounded-md object-cover"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold leading-6">{item.title}</p>
                <p className="text-sm text-muted-foreground">{formatPrice(item.price)}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Button variant="outline" size="icon" className="size-7" onClick={() => setQty(item.id, item.qty - 1)} aria-label="إنقاص الكمية">
                    <Minus className="size-3" />
                  </Button>
                  <span className="w-6 text-center text-sm">{item.qty}</span>
                  <Button variant="outline" size="icon" className="size-7" onClick={() => setQty(item.id, item.qty + 1)} aria-label="زيادة الكمية">
                    <Plus className="size-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => remove(item.id)} aria-label="حذف الكتاب">
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
              <div className="text-sm font-semibold">{formatPrice(item.price * item.qty)}</div>
            </div>
          ))}
        </div>

        <div className="space-y-3 border-t p-4">
          <div className="flex items-center justify-between text-base font-bold">
            <span>المجموع الكلي</span>
            <span>{formatPrice(total)}</span>
          </div>
          <Button className="w-full" disabled={items.length === 0} onClick={checkout}>
            إتمام الطلب عبر واتساب
          </Button>
          <Button variant="outline" className="w-full" disabled={items.length === 0} onClick={clear}>
            تفريغ السلة
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
