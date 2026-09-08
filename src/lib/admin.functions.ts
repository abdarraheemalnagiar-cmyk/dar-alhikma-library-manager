import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";

type AdminSession = { admin?: boolean };

function sessionConfig() {
  return {
    password: process.env["ADMIN_SESSION_SECRET"]!,
    name: "dar-alhikma-admin",
    maxAge: 60 * 60 * 12,
  };
}

async function isAdmin(): Promise<boolean> {
  const session = await useSession<AdminSession>(sessionConfig());
  return session.data.admin === true;
}

async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("غير مصرح");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

const TABLES = ["books", "categories", "branches", "testimonials", "faqs"] as const;
type AdminTable = (typeof TABLES)[number];

function assertTable(table: string): AdminTable {
  if (!(TABLES as readonly string[]).includes(table)) throw new Error("جدول غير معروف");
  return table as AdminTable;
}

export const adminSession = createServerFn({ method: "GET" }).handler(async () => ({
  admin: await isAdmin(),
}));

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((input: { password: string }) => ({ password: String(input?.password ?? "") }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const client = supabaseAdmin as unknown as {
      rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
    };
    const { data: ok } = await client.rpc("verify_admin_password", { _password: data.password });
    if (ok !== true) return { ok: false as const };
    const session = await useSession<AdminSession>(sessionConfig());
    await session.update({ admin: true });
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<AdminSession>(sessionConfig());
  await session.clear();
  return { ok: true };
});

export const adminData = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = await requireAdmin();
  const [books, categories, branches, testimonials, faqs, settings, orders] = await Promise.all([
    supabase.from("books").select("*").order("sort_order"),
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("branches").select("*").order("sort_order"),
    supabase.from("testimonials").select("*").order("sort_order"),
    supabase.from("faqs").select("*").order("sort_order"),
    supabase.from("settings").select("*"),
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(200),
  ]);
  const settingsMap: Record<string, string> = {};
  for (const row of settings.data ?? []) settingsMap[row.key] = row.value;
  return {
    books: books.data ?? [],
    categories: categories.data ?? [],
    branches: branches.data ?? [],
    testimonials: testimonials.data ?? [],
    faqs: faqs.data ?? [],
    settings: settingsMap,
    orders: orders.data ?? [],
  };
});

export const adminSave = createServerFn({ method: "POST" })
  .inputValidator((input: { table: string; row: Record<string, unknown> }) => ({
    table: assertTable(input?.table ?? ""),
    row: (input?.row ?? {}) as Record<string, unknown>,
  }))
  .handler(async ({ data }) => {
    const supabase = await requireAdmin();
    const row = { ...data.row };
    const id = row["id"];
    delete row["id"];
    const table = (supabase as unknown as {
      from: (t: string) => {
        update: (r: unknown) => { eq: (c: string, v: string) => Promise<{ error: { message: string } | null }> };
        insert: (r: unknown) => Promise<{ error: { message: string } | null }>;
      };
    }).from(data.table);
    const result = id ? await table.update(row).eq("id", id as string) : await table.insert(row);

    if (result.error) throw new Error(result.error.message);
    return { ok: true };
  });

export const adminDelete = createServerFn({ method: "POST" })
  .inputValidator((input: { table: string; id: string }) => ({
    table: assertTable(input?.table ?? ""),
    id: String(input?.id ?? ""),
  }))
  .handler(async ({ data }) => {
    const supabase = await requireAdmin();
    const result = await supabase.from(data.table).delete().eq("id", data.id);
    if (result.error) throw new Error(result.error.message);
    return { ok: true };
  });

export const adminReorder = createServerFn({ method: "POST" })
  .inputValidator((input: { table: string; ids: string[] }) => ({
    table: assertTable(input?.table ?? ""),
    ids: (input?.ids ?? []).map(String).slice(0, 500),
  }))
  .handler(async ({ data }) => {
    const supabase = await requireAdmin();
    await Promise.all(
      data.ids.map((id, index) => supabase.from(data.table).update({ sort_order: index }).eq("id", id)),
    );
    return { ok: true };
  });

export const adminSaveSettings = createServerFn({ method: "POST" })
  .inputValidator((input: { values: Record<string, string> }) => ({
    values: Object.fromEntries(
      Object.entries(input?.values ?? {}).map(([k, v]) => [String(k), String(v ?? "")]),
    ),
  }))
  .handler(async ({ data }) => {
    const supabase = await requireAdmin();
    const rows = Object.entries(data.values).map(([key, value]) => ({ key, value }));
    if (rows.length === 0) return { ok: true };
    const result = await supabase.from("settings").upsert(rows, { onConflict: "key" });
    if (result.error) throw new Error(result.error.message);
    return { ok: true };
  });
