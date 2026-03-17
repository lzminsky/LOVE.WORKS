# LOVEBOMB.WORKS — Comprehensive Build Handoff

> **Purpose:** This document is a complete handoff for a new Claude Code instance. It contains everything needed to understand the codebase, what was built, how it works, what's left, every decision made, and how to troubleshoot the most likely issues.
>
> **Build history:** Two sessions — Session 1 (March 2026) built P0-P3, P6, P8. Session 2 (March 2026) built P4, P5, P7 + quality fixes (shared types, direct Redis, counter caching, signed sessions).

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Tech Stack & Dependencies](#2-tech-stack--dependencies)
3. [Complete File Tree](#3-complete-file-tree)
4. [Architecture Deep Dive](#4-architecture-deep-dive)
5. [Features Built — Session 1 (P0–P3, P6, P8)](#5-features-built-p0p3-p6-p8)
6. [Features Built — Session 2 (P4, P5, P7)](#6-features-built--session-2-p4-p5-p7)
7. [Quality Fixes — Session 2](#7-quality-fixes--session-2)
8. [Every File — What It Does & Current State](#8-every-file--what-it-does--current-state)
9. [Theming System](#9-theming-system)
10. [Streaming & Data Flow](#10-streaming--data-flow)
11. [Bugs Found & Fixed](#11-bugs-found--fixed)
12. [Features NOT Built (P9)](#12-features-not-built-p9)
13. [Open Decisions](#13-open-decisions)
14. [Environment & Deployment Notes](#14-environment--deployment-notes)
15. [Known Patterns & Gotchas](#15-known-patterns--gotchas)
16. [Troubleshooting Guide](#16-troubleshooting-guide)

---

## 1. Product Overview

**lovebomb.works** is a relationship dynamics analysis app. Users describe their relationship situation in a chat interface. A Claude-powered backend applies formal economic/game-theory models (ICAPM-VRP framework with 10 extensions including option pricing, information asymmetry, mechanism design, principal-agent, credit rationing, hold-up, bargaining, contract incompleteness, tournament effects, and repeated games) and returns:

1. **Natural language analysis** — conversational, direct, sarcastic-economist-friend tone
2. **Formal reasoning** — hidden behind "Reasoned formally" toggle, contains actual math/equations
3. **Named equilibrium** — e.g. "Situationship Steady State" with confidence % and probability predictions
4. **Structured analysis** — parameter estimations and extension statuses

The conversation flows through three phases: **INTAKE** (gathering info) → **BUILDING** (mapping dynamics) → **DIAGNOSIS** (full analysis with equilibrium card).

---

## 2. Tech Stack & Dependencies

### Core
| Dep | Version | Purpose |
|-----|---------|---------|
| `next` | 14.2.21 | Framework (App Router) |
| `react` / `react-dom` | 18.3.1 | UI |
| `typescript` | 5.6.3 | Type safety |
| `tailwindcss` | 3.4.17 | Styling |
| `@tailwindcss/typography` | 0.5.15 | Prose styling for markdown |

### AI & Backend
| Dep | Version | Purpose |
|-----|---------|---------|
| `@ai-sdk/anthropic` | 1.1.6 | Claude API provider |
| `ai` | 4.1.16 | Vercel AI SDK (only `streamText` used) |
| `@upstash/ratelimit` | 2.0.1 | Sliding window rate limiting |
| `@upstash/redis` | 1.34.0 | Redis client (rate limiting, counter, permalinks) |
| `nanoid` | ^5.0.9 | Short ID generation for permalink URLs |

### Frontend
| Dep | Version | Purpose |
|-----|---------|---------|
| `react-markdown` | 9.0.1 | Markdown rendering in AI messages |
| `html-to-image` | 1.11.11 | PNG card export (dynamic import) |
| `posthog-js` | 1.187.0 | Analytics |

### Also in package.json but currently underused
| Dep | Notes |
|-----|-------|
| `@supabase/supabase-js` | Present but only used in `lib/supabase.ts` — not integrated into main flow |

### Environment Variables
```
ANTHROPIC_API_KEY=sk-ant-...          # Required — Claude API
UPSTASH_REDIS_REST_URL=...            # Optional — rate limiting, counter, permalinks (graceful fallback if missing)
UPSTASH_REDIS_REST_TOKEN=...          # Optional — rate limiting, counter, permalinks
SESSION_SECRET=...                    # Optional — HMAC signing for session cookies (unsigned fallback in dev)
NEXT_PUBLIC_POSTHOG_KEY=...           # Optional — analytics
NEXT_PUBLIC_POSTHOG_HOST=...          # Optional — analytics
```

---

## 3. Complete File Tree

```
LOVE.WORKS/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts              # Claude API streaming endpoint (+counter increment)
│   │   ├── counter/
│   │   │   └── route.ts              # GET diagnosed count from Redis (S2)
│   │   ├── diagnosis/
│   │   │   ├── route.ts              # POST store diagnosis in Redis (S2)
│   │   │   └── [id]/
│   │   │       └── route.ts          # GET retrieve diagnosis by ID (S2)
│   │   ├── og/
│   │   │   └── route.tsx             # OG image generation (Edge runtime)
│   │   └── session/
│   │       └── route.ts              # Session state GET endpoint (force-dynamic)
│   ├── d/
│   │   └── [id]/
│   │       └── page.tsx              # Permalink page — server component with OG tags (S2)
│   ├── share/
│   │   ├── page.tsx                  # Share page (server component, parses URL)
│   │   └── ShareCardClient.tsx       # Share page client UI
│   ├── terms/
│   │   └── page.tsx                  # Terms & disclaimer page (S1)
│   ├── globals.css                   # CSS variables, animations, base styles
│   ├── layout.tsx                    # Root layout with SkinProvider
│   └── page.tsx                      # Main chat page (+CatalogPanel)
│
├── components/
│   ├── chat/
│   │   ├── AIMessage.tsx             # AI response renderer (reveal, safety, parsing)
│   │   ├── ChatInput.tsx             # Textarea + send button
│   │   ├── ChatInterface.tsx         # Main chat orchestrator (+catalog write)
│   │   ├── DiagnosisReveal.tsx       # "Your diagnosis is ready" prompt (S1)
│   │   ├── MessageList.tsx           # Scrollable message container
│   │   ├── SafetyMessage.tsx         # Crisis resource display (S1)
│   │   ├── SystemMessage.tsx         # Onboarding/intro message
│   │   ├── TypingIndicator.tsx       # Loading animation + perceived queue
│   │   └── UserMessage.tsx           # User message bubble
│   ├── equilibrium/
│   │   ├── EquilibriumCard.tsx       # Named equilibrium with predictions
│   │   ├── FormalAnalysis.tsx        # Toggle + structured data display
│   │   ├── ProbabilityRow.tsx        # Animated probability bar
│   │   └── ThinkingBlock.tsx         # Parses/styles raw <thinking> content
│   ├── export/
│   │   ├── ExportCard.tsx            # Export screen (+permalink, +format toggle)
│   │   └── VerticalCard.tsx          # 1080x1920 Stories card (S1)
│   ├── gate/
│   │   ├── GateScreen.tsx            # RT-to-unlock gate UI (placeholder)
│   │   ├── TweetPreview.tsx          # Embedded tweet preview
│   │   └── VerificationStates.tsx    # Gate state machine UI
│   ├── modals/
│   │   ├── AboutPanel.tsx            # Slide-in about panel
│   │   ├── CatalogPanel.tsx          # Slide-in equilibrium catalog (S2)
│   │   ├── ResetConfirmModal.tsx     # New conversation confirmation
│   │   └── WelcomeModal.tsx          # First-visit modal
│   ├── providers/
│   │   └── AnalyticsProvider.tsx     # PostHog provider
│   └── ui/
│       ├── ErrorToast.tsx            # Error notification
│       ├── Footer.tsx                # Footer (client, SkinToggle, Terms)
│       ├── Header.tsx                # Header (nav, counter, catalog button)
│       └── SkinToggle.tsx            # Clinical/Soft theme toggle (S1)
│
├── hooks/
│   ├── useChat.ts                    # Custom streaming chat hook (re-exports types)
│   ├── useCountUp.ts                # Number count-up animation
│   └── useCounter.ts                # Diagnosed counter with module-level cache (S2)
│
├── lib/
│   ├── analytics.ts                  # PostHog event tracking
│   ├── audio.ts                      # Web Audio API reveal tone (S1)
│   ├── constants.ts                  # DISCLAIMER, COPY, CONFIG, MOCK data
│   ├── diagnosis.ts                  # Shared Redis read for diagnosis data (S2)
│   ├── equilibrium-catalog.ts        # localStorage-backed catalog (S2)
│   ├── rate-limit.ts                 # Upstash rate limiter (uses shared redis)
│   ├── redis.ts                      # Shared Redis singleton (S2)
│   ├── safety.ts                     # Safety detection + crisis resources (S1)
│   ├── session.ts                    # Cookie-based session (HMAC-signed)
│   ├── skin-context.tsx              # Skin/theme React context (S1)
│   ├── supabase.ts                   # Supabase client (not actively used)
│   ├── system-prompt.ts             # ~1400 line system prompt
│   └── types.ts                      # Canonical type definitions (S2)
│
├── tailwind.config.ts                # Colors -> CSS vars, custom animations
├── package.json                      # Dependencies
└── HANDOFF.md                        # This file
```
*(S1 = Session 1, S2 = Session 2)*

---

## 4. Architecture Deep Dive

### Request Flow

```
User types message
    |
ChatInput.tsx -> onSubmit(text)
    |
useChat.ts -> sendMessage(content)
    | POST /api/chat { messages: [...] }
    |
route.ts:
  1. getSession() — read/create cookie
  2. checkRateLimit() — Upstash sliding window
  3. Check gate (403 if messageLimitEnabled && over limit)
  4. streamText({ model: claude-sonnet-4, system: SYSTEM_PROMPT, messages })
  5. Custom ReadableStream:
     - Stream text chunks as JSON lines: {"type":"text","content":"..."}
     - After stream completes, parse full text for ```equilibrium and ```analysis JSON blocks
     - Send structured data: {"type":"equilibrium","data":{...}}
     - Send done signal: {"type":"done","promptCount":N}
  6. Set-Cookie header with updated session
    |
useChat.ts:
  - reader.read() loop
  - JSON.parse each line
  - Accumulate content in message state
  - Extract phase from <phase> tags
  - Attach equilibrium/analysis when received
    |
AIMessage.tsx:
  1. detectSafetyResponse(content) -> SafetyMessage if [SAFETY] prefix
  2. parseContent(content):
     - Strip <phase> tags
     - Extract <thinking> blocks (complete or streaming)
     - Return { mainContent, thinkingContent, isStreaming }
  3. Clean JSON block fences from display text
  4. If DIAGNOSIS phase + equilibrium + !streaming -> show DiagnosisReveal
  5. After reveal click -> show EquilibriumCard with revealCard animation
  6. FormalAnalysis toggle (structured JSON + raw thinking)
```

### Session Management

Sessions are **HMAC-signed base64-encoded JSON cookies**. No database.

```typescript
// lib/session.ts
interface Session {
  sessionId: string;        // crypto.randomUUID()
  promptCount: number;      // incremented per API call
  isUnlocked: boolean;      // gate state
  twitterHandle: string | null;
  createdAt: number;
}
// Cookie format: base64payload.hmac_signature
// Cookie: lovebomb-session, HttpOnly, SameSite=Lax, 7 day expiry
// HMAC: SHA-256 using SESSION_SECRET env var
// Fallback: if SESSION_SECRET not set, cookies are unsigned (dev mode)
```

**Security:** Cookies are tamper-resistant when `SESSION_SECRET` is set. Old unsigned cookies are silently rejected when a secret is configured — users get fresh sessions (acceptable since gate is disabled).

### Rate Limiting

```typescript
// lib/rate-limit.ts
// Three tiers via Upstash sliding window:
// - Anonymous: 1 req / 5 sec
// - Authenticated: 1 req / 3 sec
// - Authenticated hourly: 60 req / hour
// Graceful fallback: if UPSTASH env vars missing, all requests allowed
```

---

## 5. Features Built — Session 1 (P0-P3, P6, P8)

### P0: Disclaimers

**What:** Legal/safety disclaimers everywhere they need to be.

**Implementation:**
- `lib/constants.ts` line 2: `DISCLAIMER` constant — "For entertainment and self-reflection. Not professional advice. Not a substitute for therapy."
- `app/terms/page.tsx` — Full terms page with crisis resources (988, Crisis Text Line, NDVH, RAINN), no-warranty clause, privacy note
- `components/modals/AboutPanel.tsx` — Disclaimer box before footer section
- `components/export/ExportCard.tsx` — Disclaimer in bottom-right of horizontal card
- `components/export/VerticalCard.tsx` — Disclaimer at bottom of vertical card
- `app/share/ShareCardClient.tsx` — Disclaimer in bottom-right of share card
- `components/ui/Footer.tsx` — "Terms" link to /terms page

### P1: Blind Reveal

**What:** Users must click "Reveal" to see their diagnosis. Creates anticipation moment.

**Implementation:**
- `lib/audio.ts` — `playRevealTone()`: Creates an AudioContext, 880Hz sine wave oscillator, 150ms duration, 0.3->0.001 gain ramp. Handles autoplay policy by calling `ctx.resume()` before `osc.start()`.
- `components/chat/DiagnosisReveal.tsx` — Styled prompt with subtle glow border (`animate-pulse-glow`), "Your diagnosis is ready." text, "Reveal ->" button with accent styling.
- `components/chat/AIMessage.tsx`:
  - `const [revealed, setRevealed] = useState(false)` — per-message reveal state
  - `needsReveal` = equilibrium exists + DIAGNOSIS phase + not revealed + not streaming
  - When `needsReveal`: show `<DiagnosisReveal onReveal={handleReveal} />`
  - `handleReveal`: calls `playRevealTone()`, sets `revealed = true`
  - EquilibriumCard only renders when `revealed || isStreaming`
  - Card gets CSS animation: `revealCard 200ms ease-out forwards` (scale 0.95->1, opacity 0->1)
  - FormalAnalysis only renders when `!showEquilibriumCard || revealed` (gated behind reveal)

**Edge cases handled:**
- During streaming, equilibrium card shows immediately (no reveal gate) because the data is still arriving
- Reveal state is per-message (useState), so scrolling back to old diagnoses won't re-trigger

### P2: Dual Skin Toggle (Clinical / Soft)

**What:** Two visual modes — "Clinical" (dark, terminal-like) and "Soft" (warm white, approachable).

**Implementation — the full system:**

1. **CSS Variables** (`app/globals.css`):
   - `:root` block defines clinical (dark) mode defaults
   - `[data-skin="soft"]` block overrides with warm-white values
   - `html, body` get `transition: background-color 200ms ease, color 200ms ease`
   - Soft mode scrollbar overrides

2. **Tailwind Config** (`tailwind.config.ts`):
   All color entries map to CSS variables:
   ```typescript
   colors: {
     background: "var(--background)",
     surface: "var(--surface)",
     text: "var(--text)",
     // ... all 12 color tokens
   }
   ```

3. **Context** (`lib/skin-context.tsx`):
   - `SkinProvider` wraps the app in `layout.tsx`
   - State: `useState<"clinical" | "soft">("clinical")`
   - Persists to `localStorage` key `love-works-skin`
   - Sets `data-skin` attribute on `document.documentElement`
   - `useSkin()` hook returns `{ skin, toggleSkin }`

4. **Toggle UI** (`components/ui/SkinToggle.tsx`):
   - Sun icon + "Soft" label in clinical mode
   - Moon icon + "Clinical" label in soft mode
   - Placed in Footer component

5. **Component Migration** (15+ components):
   Every component was migrated from hardcoded colors to CSS variable equivalents:
   - `bg-white/[0.02]` -> `bg-[var(--overlay)]`
   - `bg-white/[0.05]` -> `bg-[var(--overlay-hover)]`
   - `border-white/[0.06]` -> `border-[var(--border)]`
   - `bg-[#111111]` -> `bg-[var(--modal-bg)]`
   - `bg-black/40` -> `bg-[var(--card-bg)]`
   - `text-white` -> `text-text`
   - `text-neutral-300` -> `text-muted`
   - `text-neutral-500` -> `text-muted-dark`
   - `text-neutral-700` -> `text-muted-darker`
   - `bg-neutral-700` -> `bg-muted-darker`
   - Removed `prose-invert` (not needed, prose colors explicitly overridden)

   **Intentionally NOT migrated:**
   - Modal backdrop overlays: `bg-black/85` and `bg-black/60` on WelcomeModal, ResetConfirmModal, AboutPanel — scrim should always be dark regardless of skin
   - `app/api/og/route.tsx` — Edge runtime, no DOM/CSS vars available, uses inline hex

6. **Skin-aware PNG Export** (`ExportCard.tsx`, `ShareCardClient.tsx`):
   ```typescript
   const { skin } = useSkin();
   const exportBg = skin === "soft" ? "#faf8f5" : "#0d0d0d";
   ```

### P3: Card Export — Vertical Stories Format

**What:** In addition to the existing 1200x628 Twitter card, add a 1080x1920 vertical Stories format with a toggle.

**Implementation:**

1. **VerticalCard** (`components/export/VerticalCard.tsx`):
   - `aspect-ratio: 1080/1920` via inline style
   - Three sections: top (ID + confidence), center (name at 48px + description), bottom (predictions + watermark + disclaimer)
   - Grid background same as horizontal card
   - `showPredictions` prop controls prediction visibility

2. **ExportCard** modifications:
   - Added `format` state: `"horizontal" | "vertical"`
   - Added `showPredictions` state with checkbox toggle
   - Added `verticalRef` alongside existing `cardRef`
   - `activeRef` = format-dependent ref selection
   - `exportWidth` / `exportHeight` derived from format (1200x628 vs 1080x1920)
   - Format toggle UI: "Twitter" / "Stories" pill buttons
   - All three export handlers use `activeRef`, `exportWidth`, `exportHeight`, `exportBg`
   - `useCallback` dependency arrays include `format` and `skin` (bug fix — see section 9)

### P6: Safety/Resource Routing

**What:** When the model detects abuse, violence, self-harm, or danger, it breaks character and shows crisis resources.

**Implementation:**

1. **System Prompt** (`lib/system-prompt.ts` lines 1353-1362):
   - Model must prefix entire response with `[SAFETY]`
   - Must NOT include `<phase>`, `<thinking>`, or JSON blocks
   - Must be human, direct, compassionate
   - UI auto-displays crisis resources

2. **Detection** (`lib/safety.ts`):
   ```typescript
   export const SAFETY_PREFIX = "[SAFETY]";
   export function detectSafetyResponse(content: string): string | null {
     if (content.trimStart().startsWith(SAFETY_PREFIX)) {
       return content.trimStart().slice(SAFETY_PREFIX.length).trimStart();
     }
     return null;
   }
   ```

3. **Crisis Resources** (`lib/safety.ts`):
   - National Domestic Violence Hotline: 1-800-799-7233
   - Crisis Text Line: Text HOME to 741741
   - 988 Suicide & Crisis Lifeline: Call or text 988
   - RAINN: 1-800-656-4673

4. **SafetyMessage** (`components/chat/SafetyMessage.tsx`):
   - Heart icon + "Your safety matters" header in `warning` color
   - AI message content (plain text, no markdown)
   - Crisis resource cards with name, description, contact
   - Reassurance footer

5. **AIMessage Integration** (`AIMessage.tsx` lines 101-105):
   Safety check happens FIRST, before any other parsing:
   ```typescript
   const safetyContent = detectSafetyResponse(content);
   if (safetyContent) {
     return <SafetyMessage content={safetyContent} />;
   }
   ```

### P8: Queue System (Perceived)

**What:** Show "N others analyzing right now" during loading to create social proof.

**Implementation** (`components/chat/TypingIndicator.tsx`):
- `usePerceivedQueue()` hook: random initial count 3-10, fluctuates +/-1 every 4-7 seconds, clamped to 2-14
- Displayed below the loading message with a subtle accent dot indicator
- Text: "{N} others analyzing right now"

---

## 6. Features Built — Session 2 (P4, P5, P7)

### P4: Diagnosis Permalinks

**What:** Shareable URLs like `lovebomb.works/d/abc123` that load a saved diagnosis from Redis.

**Implementation:**

1. **`lib/redis.ts`** — Shared Redis singleton used by rate-limit, counter, and diagnosis storage. Lazy-initialized, returns `null` if env vars are missing.

2. **`lib/diagnosis.ts`** — Shared `getDiagnosis(id)` function that reads `diagnosis:{id}` from Redis. Used by both the API route and the server component page (eliminates self-fetch pattern).

3. **`app/api/diagnosis/route.ts`** — POST handler:
   - Receives `{ equilibrium, tagline?, analysis? }` from ExportCard
   - Generates 8-char short ID via `nanoid(8)`
   - Stores in Redis as `diagnosis:{id}` with 30-day TTL (`EX: 2592000`)
   - Returns `{ id, url: "/d/{id}" }`

4. **`app/api/diagnosis/[id]/route.ts`** — GET handler wrapping `getDiagnosis()`.

5. **`app/d/[id]/page.tsx`** — Server component:
   - Calls `getDiagnosis(id)` directly (no HTTP self-fetch)
   - `generateMetadata()` creates OG tags reusing `/api/og?d=` with base64-encoded data
   - Renders `<ShareCardClient>` with diagnosis data

6. **`components/export/ExportCard.tsx`** — Added "Copy link" button:
   - Lazy permalink generation: first click POSTs to `/api/diagnosis`, caches the returned ID
   - Subsequent clicks copy the cached URL immediately
   - Uses `Analytics.shareCompleted("copy_link")` event

**Key design choice:** Permalink is generated lazily on first "Copy link" click, not on every diagnosis. This avoids Redis writes for users who never share.

### P5: Diagnosed Counter

**What:** Global "N relationships diagnosed" counter displayed in the Header.

**Implementation:**

1. **Counter increment** (`app/api/chat/route.ts`):
   - Fire-and-forget `redis.incr("lovebomb:diagnosed_count")` when equilibrium is parsed
   - `.catch(console.error)` — never blocks the stream

2. **`app/api/counter/route.ts`** — GET handler returning `{ count }`, reads `lovebomb:diagnosed_count` from Redis, returns 0 on failure.

3. **`hooks/useCounter.ts`** — Client hook with module-level cache:
   - Stale-while-revalidate: uses cached value instantly on mount, re-fetches if older than 60 seconds
   - Prevents flicker on view transitions (Header remounts when navigating to gate/export and back)

4. **`components/ui/Header.tsx`** — Shows `{count} diagnosed` in desktop nav (`hidden sm:flex`).

### P7: Equilibrium Catalog

**What:** Browse previously received equilibrium diagnoses. Client-side localStorage, no server dependency.

**Implementation:**

1. **`lib/equilibrium-catalog.ts`**:
   - `getCatalog()` — reads localStorage, returns `CatalogEntry[]`
   - `addToCatalog(entry)` — deduplicates by name (case-insensitive), prepends, caps at 50 entries
   - `clearCatalog()` — removes localStorage key
   - SSR-safe: all functions check `typeof window === "undefined"`

2. **`components/chat/ChatInterface.tsx`** — Writes to catalog in equilibrium `useEffect`

3. **`components/modals/CatalogPanel.tsx`** — Slide-in panel (matches AboutPanel pattern):
   - Lists entries with ID, name, confidence %, relative time
   - Empty state message
   - "Clear history" button

4. **`app/page.tsx`** — `showCatalog` state, conditional rendering of CatalogPanel

5. **`components/ui/Header.tsx`** — "Catalog" button in desktop nav and mobile dropdown

---

## 7. Quality Fixes — Session 2

Four quality improvements implemented after P4/P5/P7:

### 7.1 Shared Types (`lib/types.ts`)

**Problem:** `Equilibrium` was defined in 6 files, `Message` in 4, `FormalAnalysis` in 3. They had drifted — some used `string` for `phase`, others the `ConversationPhase` union; `status` in extensions was `string` in some and `"ACTIVE" | "LIKELY" | "POSSIBLE"` in others.

**Fix:** Created `lib/types.ts` with canonical definitions. Removed duplicate interfaces from:
- `hooks/useChat.ts` — re-exports types for backward compatibility
- `app/page.tsx`, `components/export/ExportCard.tsx`, `components/export/VerticalCard.tsx`
- `components/chat/AIMessage.tsx`, `components/chat/MessageList.tsx`
- `components/equilibrium/FormalAnalysis.tsx`

**Naming conflict resolved:** In `AIMessage.tsx`, both the `FormalAnalysis` component and the `FormalAnalysis` type exist. Solved by aliasing the component import: `import { FormalAnalysis as FormalAnalysisComponent }`.

### 7.2 Direct Redis in Permalink Page

**Problem:** `app/d/[id]/page.tsx` originally called `fetch(baseUrl/api/diagnosis/id)` during SSR — a server calling itself via HTTP. This relied on fragile `VERCEL_URL` detection.

**Fix:** Created `lib/diagnosis.ts` with `getDiagnosis()` that reads Redis directly. Both the page and API route use it. Eliminated `VERCEL_URL` / `NEXT_PUBLIC_BASE_URL` detection entirely.

### 7.3 Counter Hook Caching

**Problem:** `useCounter` fetched `/api/counter` on every Header mount. Header remounts when navigating between views.

**Fix:** Module-level cache (`let cached = { count, fetchedAt }`) with 60-second staleness. Cached value used instantly on mount, fetch skipped entirely if cache is fresh.

### 7.4 Signed Session Cookies

**Problem:** Session cookie was plain `base64(JSON)` — anyone could decode, set `isUnlocked: true`, re-encode, and bypass the gate.

**Fix:** HMAC-SHA256 signing via Node.js `crypto`:
- Cookie format: `base64payload.hmac_signature`
- `sign(payload)` / `verify(payload, signature)` using `SESSION_SECRET` env var
- Constant-time comparison via `timingSafeEqual`
- Graceful fallback: if `SESSION_SECRET` not set, falls back to unsigned (dev environments)
- Old unsigned cookies silently rejected when secret is configured → fresh session created

---

## 8. Every File — What It Does & Current State

### `app/api/chat/route.ts`
**Purpose:** Main API endpoint. Handles Claude streaming, session management, rate limiting.
**Key details:**
- Model: `claude-sonnet-4-20250514`
- Uses `streamText` from Vercel AI SDK, then wraps in custom `ReadableStream` for JSON line protocol
- Parses `equilibrium` and `analysis` JSON blocks post-stream (regex on full accumulated text)
- Gate check only fires if `CONFIG.messageLimitEnabled` is true (currently `false`)
- Response is `text/plain; charset=utf-8` with `Transfer-Encoding: chunked`
**Modified (S2):** Added `import { getRedis }` and fire-and-forget counter increment (`redis.incr("lovebomb:diagnosed_count")`) after equilibrium is parsed.

### `app/api/counter/route.ts` (S2)
**Purpose:** GET endpoint returning `{ count }` from Redis key `lovebomb:diagnosed_count`. Returns 0 on any failure.

### `app/api/diagnosis/route.ts` (S2)
**Purpose:** POST endpoint storing diagnosis in Redis with `nanoid(8)` short ID and 30-day TTL. Returns `{ id, url }`.

### `app/api/diagnosis/[id]/route.ts` (S2)
**Purpose:** GET endpoint wrapping `getDiagnosis()` from `lib/diagnosis.ts`.

### `app/api/session/route.ts`
**Purpose:** GET endpoint returning current session state (promptCount, maxPrompts, isUnlocked).
**Modified (S2):** Added `export const dynamic = "force-dynamic"` to prevent Next.js static rendering error (uses `cookies()`). Removed unused `createSession` import.

### `app/api/og/route.tsx`
**Purpose:** Edge runtime OG image generation.
**State:** Unmodified. Uses hardcoded hex colors (no CSS vars in Edge runtime).

### `app/d/[id]/page.tsx` (S2)
**Purpose:** Permalink page. Server component with `generateMetadata()` for OG tags. Uses `getDiagnosis()` directly (no self-fetch).

### `app/page.tsx`
**Purpose:** Main chat page. Renders `ChatInterface`.
**Modified (S2):** Added `CatalogPanel` import, `showCatalog` state, `onShowCatalog` prop to ChatInterface. Types imported from `@/lib/types`.

### `app/layout.tsx`
**Purpose:** Root layout.
**Modified:** Added `SkinProvider` wrapper around `AnalyticsProvider`.

### `app/globals.css`
**Purpose:** Global styles.
**Modified:** Added CSS variable system (`:root` + `[data-skin="soft"]`), smooth transitions on html/body, soft mode scrollbar overrides, `@keyframes revealCard` animation.

### `app/terms/page.tsx` (NEW)
**Purpose:** Static terms/disclaimer page with crisis resources, no-warranty, privacy note.

### `app/share/page.tsx`
**Purpose:** Server component that parses `?d=` query param (base64 JSON) and passes to ShareCardClient.
**State:** Unmodified.

### `app/share/ShareCardClient.tsx`
**Modified:** Full CSS variable migration + skin-aware export (`useSkin()` hook) + DISCLAIMER added to card.

### `components/chat/ChatInterface.tsx`
**Purpose:** Main orchestrator — manages views (chat, export, gate), coordinates useChat hook, modals.
**Modified (S2):** Added `addToCatalog` import, `onShowCatalog?` prop, catalog write in equilibrium useEffect, `onCatalogClick` prop to Header.

### `components/chat/AIMessage.tsx`
**Purpose:** Renders a single AI message. Most complex component in the app.
**Modified (S1):** Safety detection, blind reveal mechanic, CSS variable migration.
**Modified (S2):** Types imported from `@/lib/types`. Component import aliased as `FormalAnalysisComponent` to avoid naming conflict with type.

### `components/chat/DiagnosisReveal.tsx` (NEW)
**Purpose:** "Your diagnosis is ready" prompt with Reveal button.

### `components/chat/SafetyMessage.tsx` (NEW)
**Purpose:** Renders safety-flagged messages with crisis resources.

### `components/chat/TypingIndicator.tsx`
**Modified:** Added `usePerceivedQueue()` hook, renders queue count below loading message.
**Pre-existing features:** 50+ rotating loading messages, typewriter effect, pulsing f symbol, blinking cursor.

### `components/chat/ChatInput.tsx`
**Modified:** CSS variable migration only.

### `components/chat/SystemMessage.tsx`
**Modified:** CSS variable migration only.

### `components/chat/UserMessage.tsx`
**Modified:** CSS variable migration only. Not a client component (stateless).

### `components/chat/MessageList.tsx`
**Modified (S2):** Removed duplicate `Message` interface. Types imported from `@/lib/types`.

### `components/equilibrium/EquilibriumCard.tsx`
**Modified:** CSS variable migration.

### `components/equilibrium/FormalAnalysis.tsx`
**Modified (S1):** CSS variable migration.
**Modified (S2):** Removed duplicate `Parameter`/`Extension` interfaces. Types imported from `@/lib/types`.

### `components/equilibrium/ThinkingBlock.tsx`
**Purpose:** Parses raw `<thinking>` content into styled sections.
**Modified:** CSS variable migration.
**Parser handles:** `=== HEADERS ===`, `EXTENSION IV: Name - ACTIVE`, `MP_M: value | explanation`, pipe tables, equations with Greek letters/math notation.

### `components/equilibrium/ProbabilityRow.tsx`
**Modified:** CSS variable migration.

### `components/export/ExportCard.tsx`
**Modified (S1):** Format toggle, vertical card, skin-aware export, fixed useCallback deps.
**Modified (S2):** Permalink generation + "Copy link" button. Types imported from `@/lib/types`.

### `components/export/VerticalCard.tsx` (S1)
**Purpose:** 1080x1920 Stories-format card.
**Modified (S2):** Types imported from `@/lib/types`.

### `components/gate/GateScreen.tsx`
**Modified:** CSS variable migration only. Contains demo/placeholder controls.

### `components/gate/TweetPreview.tsx`
**Modified:** CSS variable migration only.

### `components/gate/VerificationStates.tsx`
**Modified:** CSS variable migration only.

### `components/modals/AboutPanel.tsx`
**Modified (S1):** Added DISCLAIMER box + CSS variable migration.

### `components/modals/CatalogPanel.tsx` (S2)
**Purpose:** Slide-in panel showing equilibrium catalog entries. Matches AboutPanel pattern (backdrop, slide animation, close button).

### `components/modals/WelcomeModal.tsx`
**Modified:** CSS variable migration. Backdrop kept as `bg-black/85`.

### `components/modals/ResetConfirmModal.tsx`
**Modified:** CSS variable migration. Backdrop kept as `bg-black/85`.

### `components/ui/Header.tsx`
**Modified (S1):** CSS variable migration.
**Modified (S2):** Added `useCounter` hook, `onCatalogClick?` prop, counter display (desktop-only), Catalog button in desktop nav and mobile dropdown.

### `components/ui/Footer.tsx`
**Modified:** Made client component, added SkinToggle + Terms link.

### `components/ui/SkinToggle.tsx` (NEW)
**Purpose:** Sun/moon toggle button.

### `components/ui/ErrorToast.tsx`
**State:** Unmodified.

### `components/providers/AnalyticsProvider.tsx`
**State:** Unmodified.

### `hooks/useChat.ts`
**Purpose:** Custom streaming chat hook. NOT the Vercel AI SDK `useChat`.
**Key features:** JSON line streaming, phase extraction, retry with exponential backoff (3 attempts: 1s/2s/4s), gate handling (403), rate limit handling (429), session state.
**Modified (S2):** Removed all type definitions. Re-exports types from `@/lib/types` for backward compatibility: `export type { ConversationPhase, Message, Equilibrium, FormalAnalysis } from "@/lib/types"`.

### `hooks/useCountUp.ts`
**State:** Unmodified.

### `hooks/useCounter.ts` (S2)
**Purpose:** Fetches diagnosed count from `/api/counter`. Module-level cache prevents re-fetching on every mount. 60-second staleness threshold.

### `lib/constants.ts`
**Modified (S1):** Added `DISCLAIMER` constant at line 2.

### `lib/audio.ts` (S1)
**Purpose:** `playRevealTone()` — 880Hz sine, 150ms, Web Audio API.

### `lib/diagnosis.ts` (S2)
**Purpose:** Shared `getDiagnosis(id)` function. Reads `diagnosis:{id}` from Redis. Used by API route and server component page.

### `lib/equilibrium-catalog.ts` (S2)
**Purpose:** localStorage-backed catalog. `getCatalog()`, `addToCatalog()`, `clearCatalog()`. SSR-safe. Max 50 entries, dedup by name.

### `lib/redis.ts` (S2)
**Purpose:** Shared Redis singleton. `getRedis()` returns `Redis | null`. Lazy-initialized from `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`.

### `lib/safety.ts` (S1)
**Purpose:** Safety prefix detection + crisis resource data.

### `lib/skin-context.tsx` (S1)
**Purpose:** React context for skin/theme management with localStorage persistence.

### `lib/session.ts`
**Modified (S2):** Added HMAC-SHA256 signing. Cookie format changed from `base64payload` to `base64payload.hmac_signature`. Uses `SESSION_SECRET` env var. Graceful unsigned fallback when secret not set.

### `lib/rate-limit.ts`
**Modified (S2):** Removed inline `createRedisClient()`. Now imports `getRedis()` from `lib/redis.ts`.

### `lib/types.ts` (S2)
**Purpose:** Canonical type definitions. `ConversationPhase`, `Prediction`, `Equilibrium`, `Parameter`, `Extension`, `FormalAnalysis`, `Message`.

### `lib/analytics.ts`
**State:** Unmodified.

### `lib/supabase.ts`
**State:** Unmodified. Not actively used.

### `lib/system-prompt.ts`
**Modified:** Updated "Abuse Indicators" section (lines 1353-1362) to add `[SAFETY]` prefix directive.
**Structure:** ~1400 lines covering: Critical Operating Mode, The Model (ICAPM-VRP), Ten Extensions, Behavioral Modifications (loss aversion lambda=2.25, probability weighting, sunk cost, hyperbolic discounting, reference class stickiness), Diagnostic Protocol, Response Rules, Special Cases, Sign-off style, Volume I Formal Specification.

### `tailwind.config.ts`
**Modified:** All colors -> CSS variable references. Custom animations: slide-in, pulse-dot, spin, pulse-glow, pulse-opacity, blink.

---

## 9. Theming System

### How It Works (end-to-end)

1. **On load:** `SkinProvider` reads `localStorage("love-works-skin")`. Defaults to `"clinical"`.
2. **Sets attribute:** `document.documentElement.setAttribute("data-skin", skin)` on `<html>`.
3. **CSS activates:** `:root` vars active by default. `[data-skin="soft"]` block overrides when set.
4. **Tailwind resolves:** `bg-background` -> `var(--background)` -> `#0a0a0a` (clinical) or `#faf8f5` (soft).
5. **Toggle:** User clicks SkinToggle -> `toggleSkin()` -> flips state, updates localStorage, updates `data-skin`.
6. **Transition:** `html, body { transition: background-color 200ms ease, color 200ms ease }`.

### Color Palette

| Variable | Clinical (dark) | Soft (light) |
|----------|----------------|--------------|
| `--background` | `#0a0a0a` | `#faf8f5` |
| `--surface` | `#1a1a1a` | `#ffffff` |
| `--text` | `#e5e5e5` | `#1a1a1a` |
| `--muted` | `#737373` | `#6b6b6b` |
| `--muted-dark` | `#525252` | `#8a8a8a` |
| `--muted-darker` | `#3f3f3f` | `#a3a3a3` |
| `--accent` | `#d4a574` | `#c4956a` |
| `--accent-hover` | `#e0b385` | `#b38259` |
| `--border` | `rgba(255,255,255,0.06)` | `rgba(0,0,0,0.08)` |
| `--overlay` | `rgba(255,255,255,0.02)` | `rgba(0,0,0,0.02)` |
| `--overlay-hover` | `rgba(255,255,255,0.05)` | `rgba(0,0,0,0.05)` |
| `--card-bg` | `rgba(0,0,0,0.4)` | `rgba(0,0,0,0.03)` |
| `--modal-bg` | `#111111` | `#ffffff` |
| `--error` | `#ef4444` | `#dc2626` |
| `--success` | `#4ade80` | `#16a34a` |
| `--warning` | `#fbbf24` | `#ca8a04` |

### Important: NOT using Tailwind dark mode

The app does **not** use Tailwind's built-in `dark:` variant. It uses `data-skin` attribute + CSS variable overrides. No `darkMode` in tailwind config. No `dark:bg-something` classes. All color switching happens via CSS variable swaps.

---

## 10. Streaming & Data Flow

### Stream Protocol (JSON Lines)

The API streams newline-delimited JSON:

```
{"type":"text","content":"So here's "}
{"type":"text","content":"what I'm "}
{"type":"text","content":"seeing..."}
...many more text chunks...
{"type":"equilibrium","data":{"id":"EQ-042","name":"Situationship Steady State","description":"...","confidence":70,"predictions":[...]}}
{"type":"analysis","data":{"parameters":[...],"extensions":[...]}}
{"type":"done","promptCount":3,"maxPrompts":10,"isUnlocked":false}
```

### Content Structure (what Claude outputs)

```
<phase>DIAGNOSIS</phase>
<thinking>
=== PARAMETER ESTIMATION ===
MP_M: 60-75th %ile | Active social life
...math and analysis...
</thinking>

Natural language response here.

\```equilibrium
{"id":"EQ-042","name":"...","description":"...","confidence":70,"predictions":[...]}
\```

\```analysis
{"parameters":[...],"extensions":[...]}
\```
```

### Parsing Pipeline

```
Raw Claude output
    |
route.ts: text chunks streamed as-is, JSON blocks parsed post-stream
    |
useChat.ts: accumulates text, attaches equilibrium/analysis objects to message
    |
AIMessage.tsx parseContent():
  1. Strip <phase> tags (metadata only)
  2. Extract <thinking> content (complete or incomplete/streaming)
  3. Return { mainContent, thinkingContent, isStreaming }
    |
AIMessage.tsx cleanContent:
  4. Strip equilibrium/analysis fences from display text
  5. Strip incomplete JSON blocks during streaming
    |
Render:
  - cleanContent -> ReactMarkdown
  - thinkingContent -> ThinkingBlock (headers, extensions, params, equations)
  - equilibrium data -> EquilibriumCard (after reveal)
  - analysis data -> FormalAnalysis structured display
```

---

## 11. Bugs Found & Fixed

### Bug 1: `terms/page.tsx` unmigrated border
**File:** `app/terms/page.tsx:90`
**Issue:** `border-white/[0.06]` wasn't migrated to CSS vars during P2 sweep
**Fix:** Changed to `border-[var(--border)]`

### Bug 2: `audio.ts` autoplay policy ordering
**File:** `lib/audio.ts`
**Issue:** `ctx.resume()` was called AFTER `osc.start()` / `osc.stop()`. On browsers with strict autoplay policy, the context would be suspended and scheduling silently dropped.
**Fix:** Moved `ctx.resume()` before `osc.start()`.

### Bug 3: `ExportCard.tsx` stale closure in useCallback
**File:** `components/export/ExportCard.tsx`
**Issue:** Three export handlers captured `activeRef`, `exportWidth`, `exportHeight`, `exportBg` in closures but dependency arrays only had `[equilibrium.id]`. Toggling format or skin then exporting would use stale values.
**Fix:** Added `format` and `skin` to all three dependency arrays.

### Bug 4: `ShareCardClient.tsx` fully unmigrated
**File:** `app/share/ShareCardClient.tsx`
**Issue:** Entire file missed in P2 sweep. Had hardcoded `bg-[#0d0d0d]`, `border-white/[0.08]`, no DISCLAIMER.
**Fix:** Full CSS variable migration, skin-aware export, DISCLAIMER added.

### Bug 5: `Analytics.shareCompleted("permalink")` type error (S2)
**File:** `components/export/ExportCard.tsx`
**Issue:** Used `"permalink"` which is not in the Analytics union type `"twitter" | "copy_link" | "download"`.
**Fix:** Changed to `Analytics.shareCompleted("copy_link")`.

### Bug 6: `/api/session` static rendering error (S2)
**File:** `app/api/session/route.ts`
**Issue:** Next.js tried to statically render the route at build time, but `cookies()` requires dynamic rendering.
**Fix:** Added `export const dynamic = "force-dynamic"`.

### Bug 7: ExportCard `col-span-2` layout with 4 buttons (S2)
**File:** `components/export/ExportCard.tsx`
**Issue:** "Save Conversation" had `col-span-2 sm:col-span-1` in a `grid-cols-2` layout. With the new "Copy link" button (4 buttons total), this pushed Save to a third row.
**Fix:** Removed `col-span-2 sm:col-span-1` classes.

---

## 12. Features NOT Built (P9)

### P9: RT-to-Unlock Gate

**What:** After N free messages, must like + retweet to continue.

**Current state:** Gate UI exists and works (GateScreen, TweetPreview, VerificationStates). State machine functional. All using setTimeout simulations — no real Twitter API.

**Needs:** Twitter Developer account, OAuth 2.0 PKCE flow, engagement verification API, target tweet ID.

**Complexity:** Highest remaining feature.

---

## 13. Open Decisions

| # | Decision | Options | Recommendation |
|---|----------|---------|----------------|
| 1 | Target tweet for gate (P9) | Specific tweet URL | User decision |
| 2 | Twitter Dev account (P9) | OAuth 2.0 PKCE credentials needed | User to confirm |
| 3 | Vercel plan (P9) | Hobby (10s timeout) vs Pro (60s) | Matters for OAuth |
| 4 | Counter seed number | Currently starts from 0 — consider seeding | User decision |

---

## 14. Environment & Deployment Notes

- **No local Node.js** available — cannot run builds or dev server locally
- **Git repo** on `main` branch — changes from both sessions are **unstaged** (not committed)
- **Vercel deployment** — auto-deploys from GitHub Desktop push
- **Upstash Redis** configured for rate limiting, counter, and permalinks
- **PostHog** configured for analytics
- **No test suite** — zero test coverage
- **Model:** `claude-sonnet-4-20250514` in `app/api/chat/route.ts`
- **`SESSION_SECRET`** env var needed in Vercel for signed cookies (generate with `openssl rand -hex 32`)

---

## 15. Known Patterns & Gotchas

### Pattern: CSS Variables + Tailwind
When adding new components, use Tailwind semantic classes (`bg-background`, `text-text`, `border-[var(--border)]`). Never hardcode hex colors. Check the color table in section 7.

### Pattern: "use client" Directive
Most components are client components. `UserMessage` and `TweetPreview` are notably NOT client components (stateless).

### Pattern: Modal Backdrops
Three modals use `bg-black/85` or `bg-black/60` for backdrops. Intentional — scrim should always be dark regardless of skin mode.

### Pattern: Dynamic Imports
`html-to-image` is dynamically imported in export handlers to avoid SSR issues. Keep this pattern.

### Pattern: Safe Areas
iOS notch handling via `--safe-area-*` CSS vars and `pt-safe`/`pb-safe` utility classes.

### Gotcha: System Prompt Size
~1400 lines sent with EVERY API call. Affects token usage and cost.

### Gotcha: Session Security
Cookies are now HMAC-signed when `SESSION_SECRET` is set. Without the env var, falls back to unsigned (dev mode). In production, always set `SESSION_SECRET`.

### Pattern: Type Imports
All types come from `lib/types.ts`. `hooks/useChat.ts` re-exports them so existing imports like `import { Message } from "@/hooks/useChat"` still work. When adding new components, import from `@/lib/types` directly.

### Pattern: FormalAnalysis Naming
In `AIMessage.tsx`, the `FormalAnalysis` component is imported as `FormalAnalysisComponent` because the `FormalAnalysis` type name conflicts. If you refactor imports in this file, preserve the alias.

### Pattern: Fire-and-Forget Redis
Counter increment in `app/api/chat/route.ts` uses `.catch(console.error)` — never awaited, never blocks the stream. Same pattern should be used for any non-critical Redis writes.

### Pattern: Module-Level Cache
`hooks/useCounter.ts` uses a module-level `let cached` variable that persists across component mounts (but not page reloads). This prevents unnecessary API calls on view transitions. The 60-second staleness threshold balances freshness with performance.

### Gotcha: No Local Build Verification
No Node.js locally. Manual code review is the only option.

### Gotcha: ThinkingBlock Parser Fragility
The `ThinkingBlock.tsx` parser uses regex/heuristics to detect headers, extensions, parameters, equations. Claude's output format varies — parser handles most cases but isn't bulletproof.

### Gotcha: Equilibrium JSON Not Guaranteed
Claude doesn't always output the `equilibrium` and `analysis` JSON blocks. The UI handles missing blocks gracefully (no card shown, no formal analysis section).

---

## 16. Troubleshooting Guide

This section covers the most likely issues a new instance will encounter, based on patterns from both build sessions.

### Build Failures

**"Route /api/session couldn't be rendered statically because it used `cookies`"**
- **Cause:** Next.js tries to statically render API routes at build time. Any route using `cookies()` from `next/headers` must opt out.
- **Fix:** Ensure `export const dynamic = "force-dynamic"` is present in the route file. Already done for `/api/session/route.ts`. If you create new API routes that use `cookies()`, add the same export.

**Type errors after modifying types**
- **Cause:** Types are defined canonically in `lib/types.ts` and re-exported from `hooks/useChat.ts`. If you change a type in `lib/types.ts`, all consumers update automatically. But if you add a new type, you may need to add a re-export in `hooks/useChat.ts` if other files import from there.
- **Key files to check:** `lib/types.ts` (source of truth), `hooks/useChat.ts` (re-export bridge), any component that imports types.

**`Analytics.shareCompleted("xyz")` type error**
- **Cause:** The `Analytics.shareCompleted()` function has a union type parameter: `"twitter" | "copy_link" | "download"`. Using any string not in this union will fail at build time.
- **Fix:** Use one of the three valid values. If you need a new event type, update the union in `lib/analytics.ts`.

**`FormalAnalysis` naming conflict in `AIMessage.tsx`**
- **Cause:** Both a component (`components/equilibrium/FormalAnalysis.tsx`) and a type (`lib/types.ts`) share the name `FormalAnalysis`. The component is imported as `FormalAnalysisComponent`.
- **Fix:** If you see "FormalAnalysis refers to a value but is being used as a type" or vice versa, check the import aliases at the top of `AIMessage.tsx`.

### Redis / Data Issues

**Counter shows 0**
- Check: Is `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` set in Vercel env vars?
- Check: Has anyone completed a diagnosis? Counter only increments when equilibrium is parsed in the chat stream.
- The counter starts at 0. To seed it: run `redis.set("lovebomb:diagnosed_count", 1000)` via Upstash console.

**Permalinks return 404**
- Check: Redis env vars configured?
- Check: Has the permalink expired? TTL is 30 days.
- Check: Did the user actually click "Copy link" in ExportCard? Permalinks are generated lazily.

**Permalinks work via API but `/d/{id}` page shows "not found"**
- Check: The page uses `getDiagnosis()` from `lib/diagnosis.ts` — same function as the API. If the API works but the page doesn't, the issue is likely in the page component's rendering logic, not data fetching.

### Session / Cookie Issues

**All users get fresh sessions on every request**
- Check: Is `SESSION_SECRET` set in production? If set, all old unsigned cookies are silently rejected.
- This is expected behavior after first deploying with `SESSION_SECRET` — existing users get new sessions.
- If `SESSION_SECRET` is NOT set, cookies are unsigned and should persist. Check browser DevTools for the `lovebomb-session` cookie.

**"isUnlocked: true" isn't sticking**
- The gate system (`CONFIG.messageLimitEnabled`) is currently `false`. Even if `isUnlocked` is set in the cookie, the UI won't show gate-related UI.
- To test: set `CONFIG.messageLimitEnabled = true` in `lib/constants.ts`.

### Deployment Issues

**npm warnings about deprecated packages in Vercel build logs**
- These are transitive dependencies from ESLint 8, which is required by `eslint-config-next@14.2.21` (ships with Next.js 14). Not actionable without upgrading to Next.js 15. Safe to ignore.

**`nanoid` not found**
- Ensure `"nanoid": "^5.0.9"` is in `package.json` dependencies. If `npm install` was never run (no local Node.js), it must be in `package.json` for Vercel to install it.

### Theming Issues

**New component doesn't respond to skin toggle**
- Use CSS variable classes (`bg-background`, `text-text`, `border-[var(--border)]`, etc.) instead of hardcoded colors.
- Check the color table in Section 9 of this document.
- Exception: modal backdrops should stay `bg-black/85` regardless of skin.

**PNG export has wrong background color**
- Export handlers use `const exportBg = skin === "soft" ? "#faf8f5" : "#0d0d0d"` to set the background. If a new export format is added, it needs the same skin-aware background.

### Streaming Issues

**AI response shows raw JSON blocks**
- The `cleanContent` function in `AIMessage.tsx` strips `equilibrium` and `analysis` fence blocks from the display text. If the regex doesn't match (e.g., Claude changes the fence format), raw JSON will leak through.
- Check: Is Claude outputting ` ```equilibrium ``` ` or some variant? The regex expects exactly that format.

**Equilibrium card doesn't appear**
- Claude doesn't always output the equilibrium JSON block. The system prompt instructs it to, but it's not guaranteed.
- Check: Is the message in DIAGNOSIS phase? The card only shows for DIAGNOSIS phase messages.
- Check: Is the reveal mechanic blocking it? User must click "Reveal" first (unless streaming is in progress).

**Formal analysis shows "No formal analysis available"**
- Same as above — Claude may not output the `analysis` block. Check raw message content in browser DevTools.

### Common Modification Pitfalls

**Adding a new view/page**
- If it uses `cookies()`: add `export const dynamic = "force-dynamic"`
- If it's a client component: add `"use client"` directive
- If it has colors: use CSS variable classes, not hardcoded hex

**Adding a new type**
- Add to `lib/types.ts`
- If imported from `hooks/useChat.ts` elsewhere, add re-export there too

**Adding a new Redis key**
- Use `getRedis()` from `lib/redis.ts` — never create a new Redis client
- Handle `null` return (Redis not configured)
- For non-critical writes, use fire-and-forget pattern (`.catch(console.error)`)

**Modifying the system prompt**
- File: `lib/system-prompt.ts` (~1400 lines)
- Changes affect every API call — be careful with token budget
- Safety prefix `[SAFETY]` must remain — it's how the UI detects crisis responses

---

*Generated 2026-03-16, updated 2026-03-16. Covers both build sessions (S1: P0-P3, P6, P8; S2: P4, P5, P7 + quality fixes). All changes are unstaged in git.*
