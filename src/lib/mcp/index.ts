import { defineMcp } from "@lovable.dev/mcp-js";

import getBookTool from "./tools/get-book";
import listCategoriesTool from "./tools/list-categories";
import searchBooksTool from "./tools/search-books";
import storeInfoTool from "./tools/store-info";

export default defineMcp({
  name: "dar-al-hikma-elevate",
  title: "Dar Al Hikma Elevate",
  version: "0.1.0",
  instructions:
    "Read-only tools for the Dar Al Hikma bookstore (Libya, founded 1990). Use `search_books` to find books by title, author, or category, `get_book` for full details of one book, `list_categories` to discover category slugs, and `get_store_info` for contact details, branches, and FAQs. Prices are in Libyan dinar (LYD).",
  tools: [searchBooksTool, getBookTool, listCategoriesTool, storeInfoTool],
});
