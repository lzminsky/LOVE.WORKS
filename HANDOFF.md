# LOVEBOMB.WORKS — Comprehensive Build Handoff

> **Purpose:** This document is a complete handoff for a new Claude Code instance. It contains everything needed to understand the codebase, what was built, how it works, what's left, and every decision made along the way.

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Tech Stack & Dependencies](#2-tech-stack--dependencies)
3. [Complete File Tree](#3-complete-file-tree)
4. [Architecture Deep Dive](#4-architecture-deep-dive)
5. [Features Built (P0–P3, P6, P8)](#5-features-built-p0p3-p6-p8)
6. [Every File — What It Does & Current State](#6-every-file--what-it-does--current-state)
7. [Theming System](#7-theming-system)
8. [Streaming & Data Flow](#8-streaming--data-flow)
9. [Bugs Found & Fixed](#9-bugs-found--fixed)
10. [Features NOT Built (P4, P5, P7, P9)](#10-features-not-built-p4-p5-p7-p9)
11. [Open Decisions](#11-open-decisions)
12. [Environment & Deployment Notes](#12-environment--deployment-notes)
13. [Known Patterns & Gotchas](#13-known-patterns--gotchas)

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
| `@upstash/redis` | 1.34.0 | Redis client for rate limiting |

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
UPSTASH_REDIS_REST_URL=...            # Optional — rate limiting (graceful fallback if missing)
UPSTASH_REDIS_REST_TOKEN=...          # Optional — rate limiting
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
│   │   │   └── route.ts              # Claude API streaming endpoint
│   │   ├── og/
│   │   │   └── route.tsx             # OG image generation (Edge runtime)
│   │   └── session/
│   │       └── route.ts              # Session state GET endpoint
│   ├── share/
│   │   ├── page.tsx                  # Share page (server component, parses URL)
│   │   └── ShareCardClient.tsx       # Share page client UI
│   ├── terms/
│   │   └── page.tsx                  # Terms & disclaimer page (NEW)
│   ├── globals.css                   # CSS variables, animations, base styles
│   ├── layout.tsx                    # Root layout with SkinProvider
│   └── page.tsx                      # Main chat page
│
├── components/
│   ├── chat/
│   │   ├── AIMessage.tsx             # AI response renderer (reveal, safety, parsing)
│   │   ├── ChatInput.tsx             # Textarea + send button
│   │   ├── ChatInterface.tsx         # Main chat orchestrator
│   │   ├── DiagnosisReveal.tsx       # "Your diagnosis is ready" prompt (NEW)
│   │   ├── MessageList.tsx           # Scrollable message container
│   │   ├── SafetyMessage.tsx         # Crisis resource display (NEW)
│   │   ├── SystemMessage.tsx         # Onboarding/intro message
│   │   ├── TypingIndicator.tsx       # Loading animation + perceived queue
│   │   └── UserMessage.tsx           # User message bubble
│   ├── equilibrium/
│   │   ├── EquilibriumCard.tsx       # Named equilibrium with predictions
│   │   ├── FormalAnalysis.tsx        # Toggle + structured data display
│   │   ├── ProbabilityRow.tsx        # Animated probability bar
│   │   └── ThinkingBlock.tsx         # Parses/styles raw <thinking> content
│   ├── export/
│   │   ├── ExportCard.tsx            # Export screen (format toggle, all handlers)
│   │   └── VerticalCard.tsx          # 1080x1920 Stories card (NEW)
│   ├── gate/
│   │   ├── GateScreen.tsx            # RT-to-unlock gate UI (placeholder)
│   │   ├── TweetPreview.tsx          # Embedded tweet preview
│   │   └── VerificationStates.tsx    # Gate state machine UI
│   ├── modals/
│   │   ├── AboutPanel.tsx            # Slide-in about panel
│   │   ├── ResetConfirmModal.tsx     # New conversation confirmation
│   │   └── WelcomeModal.tsx          # First-visit modal
│   ├── providers/
│   │   └── AnalyticsProvider.tsx     # PostHog provider
│   └── ui/
│       ├── ErrorToast.tsx            # Error notification
│       ├── Footer.tsx                # Footer (client, SkinToggle, Terms)
│       ├── Header.tsx                # Header (nav, prompt counter)
│       └── SkinToggle.tsx            # Clinical/Soft theme toggle (NEW)
│
├── hooks/
│   ├── useChat.ts                    # Custom streaming chat hook
│   └── useCountUp.ts                # Number count-up animation
│
├── lib/
│   ├── analytics.ts                  # PostHog event tracking
│   ├── audio.ts                      # Web Audio API reveal tone (NEW)
│   ├── constants.ts                  # DISCLAIMER, COPY, CONFIG, MOCK data
│   ├── rate-limit.ts                 # Upstash rate limiter
│   ├── safety.ts                     # Safety detection + crisis resources (NEW)
│   ├── session.ts                    # Cookie-based session (unsigned base64)
│   ├── skin-context.tsx              # Skin/theme React context (NEW)
│   ├── supabase.ts                   # Supabase client (not actively used)
│   └── system-prompt.ts             # ~1400 line system prompt
│
├── tailwind.config.ts                # Colors -> CSS vars, custom animations
├── package.json                      # Dependencies
└── HANDOFF.md                        # This file
```

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

Sessions are **unsigned base64-encoded JSON cookies**. No database. No signing.

```typescript
// lib/session.ts
interface Session {
  sessionId: string;        // crypto.randomUUID()
  promptCount: number;      // incremented per API call
  isUnlocked: boolean;      // gate state
  twitterHandle: string | null;
  createdAt: number;
}
// Encoded: btoa(JSON.stringify(session))
// Cookie: lovebomb-session, HttpOnly, SameSite=Lax, 7 day expiry
```

**Security note:** Sessions are NOT signed. A user could decode, modify promptCount, and re-encode to bypass limits. This was a conscious choice — the gate system (P9) is not yet implemented, and signing would add complexity for a feature that's currently disabled (`CONFIG.messageLimitEnabled = false`).

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

## 5. Features Built (P0-P3, P6, P8)

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

## 6. Every File — What It Does & Current State

### `app/api/chat/route.ts`
**Purpose:** Main API endpoint. Handles Claude streaming, session management, rate limiting.
**Key details:**
- Model: `claude-sonnet-4-20250514`
- Uses `streamText` from Vercel AI SDK, then wraps in custom `ReadableStream` for JSON line protocol
- Parses `equilibrium` and `analysis` JSON blocks post-stream (regex on full accumulated text)
- Gate check only fires if `CONFIG.messageLimitEnabled` is true (currently `false`)
- Response is `text/plain; charset=utf-8` with `Transfer-Encoding: chunked`
**State:** Unmodified in this session. Fully functional.

### `app/api/session/route.ts`
**Purpose:** GET endpoint returning current session state (promptCount, maxPrompts, isUnlocked).
**State:** Unmodified. Used by `useChat` on mount.

### `app/api/og/route.tsx`
**Purpose:** Edge runtime OG image generation.
**State:** Unmodified. Uses hardcoded hex colors (no CSS vars in Edge runtime).

### `app/page.tsx`
**Purpose:** Main chat page. Renders `ChatInterface`.
**State:** Unmodified.

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
**State:** Unmodified in this session.

### `components/chat/AIMessage.tsx`
**Purpose:** Renders a single AI message. Most complex component in the app.
**Modified heavily:** Safety detection, blind reveal mechanic, CSS variable migration.

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
**State:** Unmodified.

### `components/equilibrium/EquilibriumCard.tsx`
**Modified:** CSS variable migration.

### `components/equilibrium/FormalAnalysis.tsx`
**Modified:** CSS variable migration.

### `components/equilibrium/ThinkingBlock.tsx`
**Purpose:** Parses raw `<thinking>` content into styled sections.
**Modified:** CSS variable migration.
**Parser handles:** `=== HEADERS ===`, `EXTENSION IV: Name - ACTIVE`, `MP_M: value | explanation`, pipe tables, equations with Greek letters/math notation.

### `components/equilibrium/ProbabilityRow.tsx`
**Modified:** CSS variable migration.

### `components/export/ExportCard.tsx`
**Modified heavily:** Format toggle, vertical card, skin-aware export, fixed useCallback deps.

### `components/export/VerticalCard.tsx` (NEW)
**Purpose:** 1080x1920 Stories-format card.

### `components/gate/GateScreen.tsx`
**Modified:** CSS variable migration only. Contains demo/placeholder controls.

### `components/gate/TweetPreview.tsx`
**Modified:** CSS variable migration only.

### `components/gate/VerificationStates.tsx`
**Modified:** CSS variable migration only.

### `components/modals/AboutPanel.tsx`
**Modified:** Added DISCLAIMER box + CSS variable migration.

### `components/modals/WelcomeModal.tsx`
**Modified:** CSS variable migration. Backdrop kept as `bg-black/85`.

### `components/modals/ResetConfirmModal.tsx`
**Modified:** CSS variable migration. Backdrop kept as `bg-black/85`.

### `components/ui/Header.tsx`
**Modified:** CSS variable migration.

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
**State:** Unmodified.

### `hooks/useCountUp.ts`
**State:** Unmodified.

### `lib/constants.ts`
**Modified:** Added `DISCLAIMER` constant at line 2.

### `lib/audio.ts` (NEW)
**Purpose:** `playRevealTone()` — 880Hz sine, 150ms, Web Audio API.

### `lib/safety.ts` (NEW)
**Purpose:** Safety prefix detection + crisis resource data.

### `lib/skin-context.tsx` (NEW)
**Purpose:** React context for skin/theme management with localStorage persistence.

### `lib/session.ts`
**State:** Unmodified. Unsigned base64 JSON cookies.

### `lib/rate-limit.ts`
**State:** Unmodified. Upstash sliding window, three tiers.

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

## 7. Theming System

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

## 8. Streaming & Data Flow

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

## 9. Bugs Found & Fixed

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

---

## 10. Features NOT Built (P4, P5, P7, P9)

### P4: Diagnosis Permalinks

**What:** Shareable URLs like `lovebomb.works/d/abc123` that load a saved diagnosis.

**Current state:** Share system uses base64-encoded query params (`/share?d=<base64>`). Ephemeral, no server storage.

**Needs:** Server-side storage (Upstash Redis recommended — already configured).

**Would need:**
- API routes: `POST /api/diagnosis` (store), `GET /api/diagnosis/[id]` (retrieve)
- Short ID generation (nanoid)
- `app/d/[id]/page.tsx` route
- ExportCard: generate permalink URL, "Copy link" button
- TTL decision

### P5: Diagnosed Counter

**What:** Global "X relationships diagnosed" counter.

**Same infra as P4.** Redis `INCR lovebomb:diagnosed_count` on each completed diagnosis.

**Would need:** API endpoint, display in Header/WelcomeModal, seed number decision.

### P7: Equilibrium Catalog

**What:** Browse previously seen equilibrium names.

**Challenge:** Model generates names dynamically — no fixed taxonomy.

**Options:** Client-side localStorage (simplest), server-side Redis, or curated fixed list (requires prompt changes).

### P9: RT-to-Unlock Gate

**What:** After N free messages, must like + retweet to continue.

**Current state:** Gate UI exists and works (GateScreen, TweetPreview, VerificationStates). State machine functional. All using setTimeout simulations — no real Twitter API.

**Needs:** Twitter Developer account, OAuth 2.0 PKCE flow, engagement verification API, target tweet ID.

**Complexity:** Highest remaining feature.

---

## 11. Open Decisions

| # | Decision | Options | Recommendation |
|---|----------|---------|----------------|
| 1 | Storage for P4/P5 | Upstash Redis (existing) vs Vercel KV (new) | Upstash |
| 2 | Equilibrium catalog (P7) | Client localStorage vs Server Redis vs Fixed taxonomy | localStorage first |
| 3 | Counter seed number (P5) | Start from 0 vs social proof number | User decision |
| 4 | Target tweet for gate (P9) | Specific tweet URL | User decision |
| 5 | Twitter Dev account (P9) | OAuth 2.0 PKCE credentials needed | User to confirm |
| 6 | Vercel plan (P9) | Hobby (10s timeout) vs Pro (60s) | Matters for OAuth |
| 7 | Permalink TTL (P4) | 30 days? 90 days? Forever? | User decision |

---

## 12. Environment & Deployment Notes

- **No local Node.js** available — cannot run builds or dev server locally
- **Git repo** on `main` branch — all changes from this session are **unstaged** (not committed)
- **Vercel deployment** — implied by project structure
- **Upstash Redis** configured for rate limiting
- **PostHog** configured for analytics
- **No test suite** — zero test coverage
- **Model:** `claude-sonnet-4-20250514` in `app/api/chat/route.ts` line 75

---

## 13. Known Patterns & Gotchas

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
Unsigned base64 cookies. Users can tamper. Acceptable while gate is disabled.

### Gotcha: No Local Build Verification
No Node.js locally. Manual code review is the only option.

### Gotcha: ThinkingBlock Parser Fragility
The `ThinkingBlock.tsx` parser uses regex/heuristics to detect headers, extensions, parameters, equations. Claude's output format varies — parser handles most cases but isn't bulletproof.

### Gotcha: Equilibrium JSON Not Guaranteed
Claude doesn't always output the `equilibrium` and `analysis` JSON blocks. The UI handles missing blocks gracefully (no card shown, no formal analysis section).

---

*Generated 2026-03-16. Covers work from the March 2026 build session (P0-P3, P6, P8). All changes are unstaged in git.*
