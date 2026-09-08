import { defineTool } from "@lovable.dev/mcp-js";

import { supabaseAnon } from "../supabase";

export default defineTool({
  name: "list_categories",
  title: "List categories",
  description: "List all book categories in the Dar Al Hikma catalog with their slugs and Arabic names.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const supabase = supabaseAnon();
    const { data, error } = await supabase
      .from("categories")
      .select("slug, name, sort_order")
      .order("sort_order");

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const categories = data ?? [];
    return {
      content: [{ type: "text", text: JSON.stringify(categories, null, 2) }],
      structuredContent: { count: categories.length, categories },
    };
  },
});
