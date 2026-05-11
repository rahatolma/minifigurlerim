# Minifigürlerim Production Stabilization Pass - System Audit Report
**Date**: 2026-05-11
**Target**: Prepare for Production Release (Stability, Security, Performance)

---

## 1. AUTH & SESSION FLOW
**[MEDIUM] Middleware Protection Gap**
- **Problem**: `src/middleware.ts` only sets cookie headers and evaluates auth states but *does not* forcefully redirect unauthorized users. Instead, it relies entirely on Layouts (`layout.tsx`) or Pages calling `redirect('/login')`.
- **Root Cause**: Next.js 13+ migration pattern where developers prefer Layout-based protection.
- **Production Impact**: If a new protected page is added and the developer forgets to import `getAuthUserProfile()` and call `redirect()`, the route becomes completely exposed.
- **Solution**: Add explicit `NextResponse.redirect` inside `middleware.ts` for strictly protected routes (`/cto/*`, `/admin/*`, `/koleksiyonum/*`) if `user` is null.
- **Scope**: `src/middleware.ts`

---

## 2. RATE LIMIT & SERVER ACTION SECURITY
**[HIGH] Serverless Memory Map Bypass (Spam Guard)**
- **Problem**: `softRateLimitCache` inside `src/app/actions/collection.ts` uses a JavaScript `Map` to prevent rapid clicking.
- **Root Cause**: In Vercel (Serverless), memory is isolated per Lambda instance. If a user spams a button, requests might route to 3 different instances, bypassing the memory map completely and hitting the DB concurrently.
- **Production Impact**: Race conditions in the database, duplicate entries, and unnecessary API limits triggered on Upstash.
- **Solution**: Remove local `Map`. Rely entirely on `checkRateLimit` (Upstash), but optimize its latency, or implement a distributed lock.
- **Scope**: `src/app/actions/collection.ts`

**[MEDIUM] Race Conditions in Collection Toggle**
- **Problem**: `toggleCollectionStatus` accepts `currentStatus` from the client.
- **Root Cause**: If the client is out of sync or submits twice concurrently, it sends `currentStatus=null` twice, potentially causing double-inserts.
- **Production Impact**: DB constraint violations or orphaned records in `user_collections`.
- **Solution**: Ensure `toggleUserCollectionDal` uses strict `INSERT ... ON CONFLICT DO UPDATE` (UPSERT) ignoring `currentStatus`.
- **Scope**: `src/services/action_dal.ts`

---

## 3. CACHE / ISR / DYNAMIC RENDER
**[CRITICAL] Accidental Dynamic De-opt Risk**
- **Problem**: `createClient()` (Server Client) internally calls `cookies()`. Any component or service calling `createClient()` instantly forces the entire route into `force-dynamic` mode.
- **Root Cause**: `src/services/dal.ts` mixes `createPublicClient()` and `createClient()`.
- **Production Impact**: If a developer imports a method like `getUserProfile()` into a public static page (e.g., to check if logged in for a UI toggle), the entire page loses ISR cache and becomes dynamic, killing TTFB performance.
- **Solution**: Strictly segregate the DAL. Move all `createClient()` methods to `dal_private.ts` and use `server-only`. 
- **Scope**: `src/services/dal.ts`

---

## 4. BLOG CMS / BLOCK RENDERER
**[MEDIUM] Runtime Validation Absence**
- **Problem**: `BlogBlockRenderer` assumes the parsed JSON is valid and structurally sound.
- **Root Cause**: Lack of strict schema typing during the JSON parse phase.
- **Production Impact**: If the CMS AI generates a block missing `type` or with a malformed `data` object, the component might throw an obscure React error during hydration.
- **Solution**: Introduce a `zod` schema to validate `parsedBlocks` before rendering. If a block fails validation, skip it gracefully.
- **Scope**: `src/components/ui/BlogBlockRenderer.tsx`

---

## 5. UI/UX STATE CONSISTENCY
**[MEDIUM] Modal Router Race Conditions**
- **Problem**: In `CollectionActions.tsx`, cleaning up the URL parameters uses `router.replace(pathname, { scroll: false })` immediately after state updates.
- **Root Cause**: React's concurrent rendering and Next.js App Router can clash if multiple query updates fire simultaneously.
- **Production Impact**: UI hangs or "Critical Error" screens when spamming the modal close/open buttons.
- **Solution**: Wrap `router.replace` in `startTransition` or a `setTimeout` to yield to the React rendering cycle.
- **Scope**: `src/components/ui/CollectionActions.tsx`

---

## 6. DATABASE & DAL REVIEW
**[HIGH] Service Role Overuse on Public Data**
- **Problem**: `getSimilarFiguresDal` and `getFigureRatings` use `getAdminClient()` (Service Role) to fetch data.
- **Root Cause**: Attempting to bypass RLS or avoid `cookies()` injection to keep the route static.
- **Production Impact**: Exposing the Service Role to frontend-callable actions increases the blast radius if an injection vulnerability exists. Public data should be readable via anon key without RLS blocking it.
- **Solution**: Adjust RLS policies on `user_ratings` and `minifigures` so `createPublicClient()` can read them anonymously. Move these fetches back to `dal.ts`.
- **Scope**: `src/services/action_dal.ts`, Supabase RLS Policies

---

## 7. OBSERVABILITY & ERROR HANDLING
**[LOW] Silent Failures in Analytics**
- **Problem**: `trackUserViewDal` and targeted revalidates have empty or minimal `catch` blocks.
- **Root Cause**: Attempt to prevent page crashes.
- **Production Impact**: Loss of crucial analytics and cache staleness without alerting developers.
- **Solution**: Integrate Sentry `captureException` inside these catch blocks.
- **Scope**: `src/app/api/track-view/route.ts`, `src/app/actions/collection.ts`

---

## 8. PERFORMANCE
**[MEDIUM] Data Payload Bloat in Static Generation**
- **Problem**: `getAllMinifigures()` fetches the entire `MINIFIGURES_SELECT_FIELDS` (including heavy text like `description`).
- **Root Cause**: Used for simple catalogs or sitemap generation.
- **Production Impact**: During Next.js build or ISR regeneration, passing massive JSON arrays increases memory consumption and build times.
- **Solution**: Create a `getMinifigureSlugs()` function that only selects `id, slug, series_id` for routing purposes.
- **Scope**: `src/services/dal.ts`

---

## 9. I18N / LOCALE
**[LOW] API Route I18n Capture**
- **Problem**: `request.nextUrl.pathname.startsWith('/api')` bypasses i18n, but if a request hits `/tr/api/...`, it gets caught by the locale matcher and fails.
- **Root Cause**: Hardcoded path prefix checks in middleware.
- **Production Impact**: Breaking API integrations if clients prefix the locale.
- **Solution**: Improve regex matching in `middleware.ts` to ignore locale prefixes for API routes.
- **Scope**: `src/middleware.ts`
