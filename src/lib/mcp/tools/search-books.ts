import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { supabaseAnon } from "../supabase";

export default defineTool({
  name: "search_books",
  title: "Search books",
  description:
    "Search the Dar Al Hikma bookstore catalog by title, author, or category slug. Returns matching books with price in Libyan dinar and availability.",
  inputSchema: {
    query: z.string().trim().optional().describe("Free text matched against book title and author."),
    category: z.string().trim().optional().describe("Category slug, e.g. 'psychology'."),
    only_in_stock: z.boolean().optional().describe("Return only books currently in stock."),
    limit: z.number().int().min(1).max(50).optional().describe("Maximum number of books (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, category, only_in_stock, limit }) => {
    const supabase = supabaseAnon();

    let categoryId: string | null = null;
    if (category) {
      const { data: cat } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", category)
        .maybeSingle();
      if (!cat) {
        return { content: [{ type: "text", text: `No category with slug "${category}".` }], isError: true };
      }
      categoryId = cat.id as string;
    }

    let builder = supabase
      .from("books")
      .select("slug, title, author, description, price, rating, in_stock, is_bestseller, is_new, category_id")
      .order("sort_order")
      .limit(limit ?? 20);

    if (categoryId) builder = builder.eq("category_id", categoryId);
    if (only_in_stock) builder = builder.eq("in_stock", true);
    if (query) {
      const safe = query.replace(/[,%()]/g, " ").trim();
      if (safe) builder = builder.or(`title.ilike.%${safe}%,author.ilike.%${safe}%`);
    }

    const { data, error } = await builder;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const books = (data ?? []).map((b) => ({ ...b, price: Number(b.price) }));
    return {
      content: [{ type: "text", text: JSON.stringify(books, null, 2) }],
      structuredContent: { count: books.length, books },
    };
  },
});
