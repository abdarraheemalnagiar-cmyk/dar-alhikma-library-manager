import { defineTool } from "@lovable.dev/mcp-js";

import { supabaseAnon } from "../supabase";

const PUBLIC_SETTING_KEYS = ["phone", "whatsapp", "email", "facebook", "about_text", "announcement_text"];

export default defineTool({
  name: "get_store_info",
  title: "Store info and branches",
  description:
    "Get Dar Al Hikma bookstore contact details, opening hours, branch addresses, and frequently asked questions.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const supabase = supabaseAnon();
    const [settingsRes, branchesRes, faqsRes] = await Promise.all([
      supabase.from("settings").select("key, value"),
      supabase.from("branches").select("name, address, phone, hours, maps_url, is_main").order("sort_order"),
      supabase.from("faqs").select("question, answer").order("sort_order"),
    ]);

    const error = settingsRes.error ?? branchesRes.error ?? faqsRes.error;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const contact: Record<string, string> = {};
    for (const row of settingsRes.data ?? []) {
      if (PUBLIC_SETTING_KEYS.includes(row.key)) contact[row.key] = row.value;
    }

    const info = {
      store: "مكتبة دار الحكمة",
      founded: 1990,
      currency: "LYD",
      contact,
      branches: branchesRes.data ?? [],
      faqs: faqsRes.data ?? [],
    };

    return {
      content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
      structuredContent: info,
    };
  },
});
