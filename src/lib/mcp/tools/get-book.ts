import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { supabaseAnon } from "../supabase";

export default defineTool({
  name: "get_book",
  title: "Get book details",
  description: "Get full details of one Dar Al Hikma book by its slug, including category name and price.",
  inputSchema: { slug: z.string().trim().min(1).describe("Book slug, as returned by search_books.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug }) => {
    const supabase = supabaseAnon();
    const { data, error } = await supabase
      .from("books")
      .select(
        "slug, title, author, description, price, rating, words, in_stock, is_bestseller, is_new, categories(slug, name)",
      )
      .eq("slug", slug)
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: `No book with slug "${slug}".` }], isError: true };

    const book = { ...data, price: Number(data.price) };
    return {
      content: [{ type: "text", text: JSON.stringify(book, null, 2) }],
      structuredContent: { book },
    };
  },
});
