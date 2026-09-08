import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  adminSession,
  adminLogin,
  adminLogout,
  adminData,
  adminSave,
  adminDelete,
  adminReorder,
  adminSaveSettings,
} from "@/lib/admin.functions";
import { SITE_NAME } from "@/lib/site";
import type { Book, Category, Branch, Testimonial, Faq } from "@/lib/public.functions";

// "is_active" controls whether an item is visible on the public site (enforced by
// database policy). It's not part of the public-facing types above, so it's added here.
type AdminBook = Book & { is_active: boolean };
type AdminTestimonial = Testimonial & { is_active: boolean };
type AdminFaq = Faq & { is_active: boolean };

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: `لوحة التحكم — ${SITE_NAME}` }],
  }),
  component: AdminPage,
});

/* ---------------------------------- الصفحة الرئيسية ---------------------------------- */

function AdminPage() {
  const queryClient = useQueryClient();
  const { data: session, isLoading } = useQuery({
    queryKey: ["admin-session"],
    queryFn: () => adminSession(),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center text-muted-foreground">
        جارٍ التحميل…
      </div>
    );
  }

  if (!session?.admin) {
    return (
      <AdminLogin
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["admin-session"] })}
      />
    );
  }

  return <AdminDashboard />;
}

/* ---------------------------------- تسجيل الدخول ---------------------------------- */

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await adminLogin({ data: { password } });
      if (res.ok) {
        onSuccess();
      } else {
        setError("كلمة المرور غير صحيحة.");
      }
    } catch {
      setError("تعذّر تسجيل الدخول. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col justify-center px-4 py-10">
      <h1 className="mb-1 text-xl font-bold">تسجيل دخول الإدارة</h1>
      <p className="mb-6 text-sm text-muted-foreground">أدخل كلمة مرور الإدارة للمتابعة.</p>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="admin-password">كلمة المرور</Label>
          <Input
            id="admin-password"
            type="password"
            dir="ltr"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
            className="mt-1"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading || password.length === 0}>
          {loading ? "جارٍ الدخول…" : "دخول"}
        </Button>
      </form>
    </div>
  );
}

/* ---------------------------------- لوحة التحكم ---------------------------------- */

function AdminDashboard() {
  const queryClient = useQueryClient();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-data"],
    queryFn: () => adminData(),
  });

  const logout = async () => {
    try {
      await adminLogout();
    } finally {
      queryClient.invalidateQueries({ queryKey: ["admin-session"] });
      queryClient.removeQueries({ queryKey: ["admin-data"] });
    }
  };

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center text-muted-foreground">
        جارٍ تحميل بيانات لوحة التحكم…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold md:text-2xl">لوحة تحكم {SITE_NAME}</h1>
        <Button variant="outline" size="sm" onClick={logout}>
          تسجيل الخروج
        </Button>
      </div>

      <Tabs defaultValue="books" dir="rtl">
        <TabsList className="mb-6 h-auto flex-wrap">
          <TabsTrigger value="books">الكتب</TabsTrigger>
          <TabsTrigger value="categories">التصنيفات</TabsTrigger>
          <TabsTrigger value="branches">الفروع</TabsTrigger>
          <TabsTrigger value="testimonials">آراء العملاء</TabsTrigger>
          <TabsTrigger value="faqs">الأسئلة الشائعة</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          <TabsTrigger value="orders">الطلبات</TabsTrigger>
        </TabsList>

        <TabsContent value="books">
          <TableEditor<AdminBook>
            table="books"
            rows={data.books as AdminBook[]}
            onChanged={refetch}
            emptyRow={{
              title: "",
              author: "",
              slug: "",
              description: "",
              rating: "5",
              price: 0,
              cover_url: "",
              in_stock: true,
              is_active: true,
              is_bestseller: false,
              is_new: true,
              category_id: data.categories[0]?.id ?? null,
              sort_order: data.books.length,
            }}
            fields={[
              { key: "title", label: "العنوان", type: "text" },
              { key: "author", label: "المؤلف", type: "text" },
              { key: "slug", label: "الرابط (slug)", type: "text" },
              {
                key: "category_id",
                label: "التصنيف",
                type: "select",
                options: data.categories.map((c) => ({ value: c.id, label: c.name })),
              },
              { key: "price", label: "السعر (د.ل)", type: "number" },
              { key: "rating", label: "التقييم (مثال: 4.5)", type: "text" },
              { key: "cover_url", label: "رابط صورة الغلاف", type: "text" },
              { key: "description", label: "الوصف", type: "textarea" },
              { key: "in_stock", label: "متوفر بالمخزون", type: "boolean" },
              { key: "is_active", label: "ظاهر بالموقع", type: "boolean" },
              { key: "is_bestseller", label: "الأكثر مبيعاً", type: "boolean" },
              { key: "is_new", label: "جديد", type: "boolean" },
            ]}
            titleOf={(r) => r.title || "كتاب جديد"}
          />
        </TabsContent>

        <TabsContent value="categories">
          <TableEditor<Category>
            table="categories"
            rows={data.categories}
            onChanged={refetch}
            emptyRow={{ name: "", slug: "", cover_key: "cover-classic", sort_order: data.categories.length }}
            fields={[
              { key: "name", label: "الاسم", type: "text" },
              { key: "slug", label: "الرابط (slug)", type: "text" },
              {
                key: "cover_key",
                label: "غلاف افتراضي",
                type: "select",
                options: [
                  "cover-classic",
                  "cover-philosophy",
                  "cover-fairy",
                  "cover-fantasy",
                  "cover-selfdev",
                  "cover-romance",
                  "cover-manga",
                  "cover-puzzles",
                  "cover-psychology",
                ].map((k) => ({ value: k, label: k })),
              },
            ]}
            titleOf={(r) => r.name || "تصنيف جديد"}
          />
        </TabsContent>

        <TabsContent value="branches">
          <TableEditor<Branch>
            table="branches"
            rows={data.branches}
            onChanged={refetch}
            emptyRow={{
              name: "",
              address: "",
              phone: "",
              maps_url: "",
              hours: "",
              is_main: false,
              sort_order: data.branches.length,
            }}
            fields={[
              { key: "name", label: "اسم الفرع", type: "text" },
              { key: "address", label: "العنوان", type: "text" },
              { key: "phone", label: "الهاتف", type: "text" },
              { key: "hours", label: "ساعات العمل", type: "text" },
              { key: "maps_url", label: "رابط خرائط Google", type: "text" },
              { key: "is_main", label: "الفرع الرئيسي", type: "boolean" },
            ]}
            titleOf={(r) => r.name || "فرع جديد"}
          />
        </TabsContent>

        <TabsContent value="testimonials">
          <TableEditor<AdminTestimonial>
            table="testimonials"
            rows={data.testimonials as AdminTestimonial[]}
            onChanged={refetch}
            emptyRow={{ name: "", rating: 5, comment: "", is_active: true, sort_order: data.testimonials.length }}
            fields={[
              { key: "name", label: "اسم العميل", type: "text" },
              { key: "rating", label: "التقييم (1-5)", type: "number" },
              { key: "comment", label: "التعليق", type: "textarea" },
              { key: "is_active", label: "ظاهر بالموقع", type: "boolean" },
            ]}
            titleOf={(r) => r.name || "رأي جديد"}
          />
        </TabsContent>

        <TabsContent value="faqs">
          <TableEditor<AdminFaq>
            table="faqs"
            rows={data.faqs as AdminFaq[]}
            onChanged={refetch}
            emptyRow={{ question: "", answer: "", is_active: true, sort_order: data.faqs.length }}
            fields={[
              { key: "question", label: "السؤال", type: "text" },
              { key: "answer", label: "الإجابة", type: "textarea" },
              { key: "is_active", label: "ظاهر بالموقع", type: "boolean" },
            ]}
            titleOf={(r) => r.question || "سؤال جديد"}
          />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsPanel settings={data.settings} onSaved={refetch} />
        </TabsContent>

        <TabsContent value="orders">
          <OrdersPanel orders={data.orders as OrderRow[]} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------------------------------- محرر جدول عام ---------------------------------- */

type FieldType = "text" | "textarea" | "number" | "boolean" | "select";

type FieldConfig<T> = {
  key: keyof T;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
};

type WithId = { id?: string };

function TableEditor<T extends WithId>({
  table,
  rows,
  fields,
  emptyRow,
  onChanged,
  titleOf,
}: {
  table: string;
  rows: T[];
  fields: FieldConfig<T>[];
  emptyRow: Omit<T, "id">;
  onChanged: () => void;
  titleOf: (row: T) => string;
}) {
  const [localRows, setLocalRows] = useState<T[]>(rows);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  useEffect(() => {
    setLocalRows(
      rows.map((r) => {
        const copy: Record<string, unknown> = { ...r };
        for (const f of fields) {
          if (f.type === "number" && copy[f.key as string] != null) {
            copy[f.key as string] = Number(copy[f.key as string]);
          }
        }
        return copy as T;
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  const rowKey = (row: T, idx: number) => row.id || `new-${idx}`;

  const updateField = (idx: number, key: keyof T, value: unknown) => {
    setLocalRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [key]: value } : r)));
  };

  const saveRow = async (idx: number) => {
    const row = localRows[idx];
    const key = rowKey(row, idx);
    setBusyKey(key);
    try {
      await adminSave({ data: { table, row: row as Record<string, unknown> } });
      toast.success("تم الحفظ بنجاح");
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "فشل حفظ العنصر");
    } finally {
      setBusyKey(null);
    }
  };

  const deleteRow = async (idx: number) => {
    const row = localRows[idx];
    if (!row.id) {
      setLocalRows((prev) => prev.filter((_, i) => i !== idx));
      return;
    }
    if (!window.confirm("هل تريد حذف هذا العنصر نهائياً؟")) return;
    const key = rowKey(row, idx);
    setBusyKey(key);
    try {
      await adminDelete({ data: { table, id: row.id } });
      toast.success("تم الحذف");
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "فشل الحذف");
    } finally {
      setBusyKey(null);
    }
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const next = idx + dir;
    if (next < 0 || next >= localRows.length) return;
    const reordered = [...localRows];
    const tmp = reordered[idx];
    reordered[idx] = reordered[next];
    reordered[next] = tmp;
    setLocalRows(reordered);
    const ids = reordered.map((r) => r.id).filter((v): v is string => Boolean(v));
    try {
      await adminReorder({ data: { table, ids } });
      onChanged();
    } catch {
      toast.error("تعذّر حفظ الترتيب الجديد");
    }
  };

  const addRow = () => {
    setLocalRows((prev) => [...prev, { ...emptyRow } as T]);
  };

  return (
    <div className="space-y-4">
      {localRows.length === 0 && (
        <p className="py-6 text-center text-sm text-muted-foreground">لا توجد عناصر بعد.</p>
      )}

      {localRows.map((row, idx) => {
        const key = rowKey(row, idx);
        const busy = busyKey === key;
        return (
          <Card key={key}>
            <CardContent className="grid gap-3 pt-4 sm:grid-cols-2">
              <p className="text-sm font-semibold sm:col-span-2">{titleOf(row)}</p>
              {fields.map((f) => (
                <FieldInput
                  key={String(f.key)}
                  field={f}
                  value={row[f.key]}
                  onChange={(v) => updateField(idx, f.key, v)}
                />
              ))}
            </CardContent>
            <CardFooter className="flex items-center justify-between gap-2 border-t pt-3">
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => move(idx, -1)} disabled={idx === 0 || busy}>
                  ↑
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => move(idx, 1)}
                  disabled={idx === localRows.length - 1 || busy}
                >
                  ↓
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="destructive" size="sm" onClick={() => deleteRow(idx)} disabled={busy}>
                  حذف
                </Button>
                <Button size="sm" onClick={() => saveRow(idx)} disabled={busy}>
                  {busy ? "جارٍ الحفظ…" : "حفظ"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        );
      })}

      <Button variant="outline" className="w-full" onClick={addRow}>
        + إضافة عنصر جديد
      </Button>
    </div>
  );
}

function FieldInput<T>({
  field,
  value,
  onChange,
}: {
  field: FieldConfig<T>;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const wrapperClass = field.type === "textarea" ? "sm:col-span-2" : "";

  if (field.type === "boolean") {
    return (
      <div className={`flex items-center gap-2 ${wrapperClass}`}>
        <Switch checked={Boolean(value)} onCheckedChange={onChange} />
        <Label className="text-sm">{field.label}</Label>
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <Label className="mb-1 block text-xs text-muted-foreground">{field.label}</Label>
      {field.type === "textarea" ? (
        <Textarea rows={3} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
      ) : field.type === "select" ? (
        <select
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">—</option>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <Input
          type={field.type === "number" ? "number" : "text"}
          value={(value as string | number) ?? ""}
          onChange={(e) => onChange(field.type === "number" ? Number(e.target.value) : e.target.value)}
        />
      )}
    </div>
  );
}

/* ---------------------------------- الإعدادات ---------------------------------- */

function SettingsPanel({
  settings,
  onSaved,
}: {
  settings: Record<string, string>;
  onSaved: () => void;
}) {
  const [values, setValues] = useState(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => setValues(settings), [settings]);

  const set = (key: string, value: string) => setValues((v) => ({ ...v, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      await adminSaveSettings({ data: { values } });
      toast.success("تم حفظ الإعدادات");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "فشل حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
        <div>
          <Label>رقم واتساب (بدون +)</Label>
          <Input dir="ltr" value={values["whatsapp"] ?? ""} onChange={(e) => set("whatsapp", e.target.value)} />
        </div>
        <div>
          <Label>رقم الهاتف</Label>
          <Input dir="ltr" value={values["phone"] ?? ""} onChange={(e) => set("phone", e.target.value)} />
        </div>
        <div className="flex items-center gap-2 sm:col-span-2">
          <Switch
            checked={values["announcement_enabled"] === "true"}
            onCheckedChange={(c) => set("announcement_enabled", c ? "true" : "false")}
          />
          <Label>تفعيل شريط الإعلان أعلى الموقع</Label>
        </div>
        <div className="sm:col-span-2">
          <Label>نص الإعلان</Label>
          <Input
            value={values["announcement_text"] ?? ""}
            onChange={(e) => set("announcement_text", e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Label>نص قسم "من نحن"</Label>
          <Textarea rows={4} value={values["about_text"] ?? ""} onChange={(e) => set("about_text", e.target.value)} />
        </div>
      </CardContent>
      <CardFooter className="border-t pt-3">
        <Button onClick={save} disabled={saving}>
          {saving ? "جارٍ الحفظ…" : "حفظ الإعدادات"}
        </Button>
      </CardFooter>
    </Card>
  );
}

/* ---------------------------------- الطلبات ---------------------------------- */

type OrderRow = {
  id: string;
  created_at: string;
  total: number;
  items: { title: string; qty: number; price: number }[];
};

function OrdersPanel({ orders }: { orders: OrderRow[] }) {
  if (orders.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">لا توجد طلبات بعد.</p>;
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardContent className="pt-4">
            <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
              <span>{new Date(order.created_at).toLocaleString("ar-LY")}</span>
              <span className="font-semibold text-foreground">
                {Number(order.total).toLocaleString("ar-LY")} د.ل
              </span>
            </div>
            <ul className="space-y-1 text-sm">
              {(order.items ?? []).map((item, i) => (
                <li key={i} className="flex justify-between">
                  <span>
                    {item.title} × {item.qty}
                  </span>
                  <span dir="ltr">{Number(item.price).toLocaleString("ar-LY")} د.ل</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
