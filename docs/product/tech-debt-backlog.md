# Technical Debt & Architecture Backlog

## DB Schema: News Content Storage (JSON in TEXT)
**Status:** Conscious Technical Debt  
**Date Logged:** 2026-05-06  

### Context
We have shifted the blog rendering paradigm from raw WYSIWYG HTML to a structured JSON Block-based editorial engine (`ArticleBlockRenderer`). 
However, the `news` table in Supabase still defines `content` and `content_blocks_en` as `TEXT` columns.

### Current Implementation
Currently, the system safely stores serialized JSON strings inside these `TEXT` columns. The public renderer (`haberler/[slug]/page.tsx`) uses a defensive parsing strategy: it attempts to `JSON.parse` strings starting with `[`. If successful, it treats the payload as structured `ArticleBlocks`. If parsing fails, it safely falls back to standard `RichTextContent` HTML rendering.

### Why It's Debt
Storing structured block data as a stringified JSON array in a `TEXT` column prevents us from utilizing PostgreSQL's native JSON capabilities. We cannot natively query, index, or safely manipulate specific blocks at the database level.

### Proposed Resolution (Migration to JSONB)
In the future, when we deprecate raw HTML articles entirely and strictly enforce the block engine, we must execute a non-destructive migration to cast these fields to `JSONB`.

*Migration Plan:*
1. Add new columns `article_blocks` (JSONB) and `article_blocks_en` (JSONB).
2. Write an edge function or SQL migration to safely parse existing JSON strings and migrate them to the new columns.
3. Keep the `TEXT` columns strictly for legacy HTML fallback if needed, or drop them if fully migrated.

### SEO Consideration
Currently, the SEO `generateArticleSchema` only consumes `summary` and `title`, so storing JSON in the `content` field does not break our JSON-LD injections. In the future, we may want to traverse the JSONB tree to extract the `faq` blocks and dynamically generate `FAQPage` schema on the server side.
