# LOVEBOMB.WORKS — Development Handoff

## Overview

**lovebomb.works** is a relationship dynamics advisor built on a formal economic model. It applies ICAPM (Merton), variance risk premium, game theory, mechanism design, and behavioral economics to analyze relationship situations.

The product is a chat interface where users describe their relationship situations and receive formal economic analysis alongside natural language explanations.

---

## Architecture

### Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **AI:** Anthropic Claude via `@ai-sdk/anthropic` + Vercel AI SDK (`ai`)
- **Session:** Cookie-based sessions (no database)

### Key Files

| File | Purpose |
|------|---------|
| `app/api/chat/route.ts` | API route handling Claude calls, streaming, parsing |
| `lib/system-prompt.ts` | The entire model specification (~1500 lines) |
| `lib/constants.ts` | UI copy, configuration, mock data |
| `components/chat/` | Chat UI components |
| `components/equilibrium/` | Specialized display components for model output |

---

## Model & Prompt Configuration

### Location
The system prompt lives in:
```
lib/system-prompt.ts
```

Export: `SYSTEM_PROMPT`

### Model Used
```typescript
// app/api/chat/route.ts, line 51
model: anthropic("claude-sonnet-4-20250514")
```

Currently using **Claude Sonnet 4** (May 2025 release).

### Prompt Structure

The system prompt is ~1500 lines and includes:

1. **Critical Operating Mode** (lines 1-270)
   - Response structure requirements
   - `<thinking>` block format specification
   - Example of complete formal analysis

2. **Part 1: The Model** (lines 272-326)
   - Core utility functions (male/female)
   - Market position definitions
   - Thresholds and transaction outcomes

3. **Part 2: Ten Extensions** (lines 328-432)
   - Option Pricing, Information Asymmetry, Mechanism Design
   - Principal-Agent, Credit Rationing, Hold-Up
   - Bargaining, Contract Incompleteness, Tournament Effects, Repeated Games

4. **Part 3: Behavioral Modifications** (lines 434-481)
   - Loss aversion (λ = 2.25)
   - Probability weighting
   - Sunk cost sensitivity
   - Hyperbolic discounting
   - Reference class stickiness

5. **Part 4: Diagnostic Protocol** (lines 483-739)
   - Mandatory formal reasoning structure
   - Step-by-step analysis requirements
   - Extension checklist

6. **Part 5: Response Rules** (lines 741-929)
   - Directness calibration by evidence strength
   - Required elements per response
   - Forbidden behaviors

7. **Part 6: Special Cases** (lines 931-951)
   - Same-sex relationships
   - Abuse indicators
   - Cultural/religious context

8. **Volume I: Formal Specification** (lines 992-1499)
   - Complete mathematical framework
   - All symbol definitions
   - Literature mappings

### Response Format

The model outputs in this structure:

1. **`<thinking>` block** — Formal analysis (parsed and styled in UI)
2. **Natural language response** — User-friendly explanation
3. **JSON blocks** (optional) — Structured data:
   - ` ```equilibrium ` — Equilibrium card data
   - ` ```analysis ` — Formal analysis parameters

### Parsing Pipeline

```
Claude Response
    ↓
app/api/chat/route.ts
    ↓ streams text chunks
    ↓ parses ```equilibrium and ```analysis blocks post-stream
    ↓
useChat.ts hook
    ↓ accumulates content
    ↓ attaches equilibrium/formalAnalysis to message
    ↓
AIMessage.tsx
    ↓ parseThinkingBlock() extracts <thinking> content
    ↓ strips JSON blocks from display
    ↓
FormalAnalysis.tsx → ThinkingBlock.tsx
    ↓ parses ASCII format (=== HEADERS ===, params, extensions)
    ↓ renders styled components
```

---

## What Was Built (This Session)

### 1. Thinking Block Streaming Fix
**Problem:** Raw `<thinking>` tags and ASCII formatting visible during streaming.

**Solution:**
- `AIMessage.tsx`: `parseThinkingBlock()` now handles incomplete blocks during streaming
- Shows "Reasoning formally..." indicator while thinking streams
- Strips incomplete JSON blocks from display

### 2. Enhanced Loading Indicator
**Problem:** Boring "Reasoning formally..." text during wait.

**Solution:** `TypingIndicator.tsx` now has:
- 50+ rotating messages (econ, technical, funny)
- Typewriter effect (35ms/char)
- Pulsing ƒ symbol with glow animation
- Blinking cursor
- Messages shuffle on each load

### 3. Thinking Block Styling
**Problem:** Raw ASCII output aesthetically unpleasant.

**Solution:** `ThinkingBlock.tsx` parses and styles:
- `=== SECTION HEADERS ===` → styled headers
- `EXTENSION IV: Name — ACTIVE` → extension cards with status badges
- `MP_M: value | explanation` → 3-column parameter rows
- Pipe tables → actual HTML tables
- Equations → highlighted code blocks

### 4. Tailwind Animations
Added to `tailwind.config.ts`:
- `animate-pulse-glow` — Container glow effect
- `animate-pulse-opacity` — Symbol pulse
- `animate-blink` — Cursor blink

---

## What's NOT Done / Known Issues

### 1. Model Output Consistency
The model doesn't always output in the exact expected format. Sometimes:
- `<thinking>` blocks have varying structure
- JSON blocks aren't always included
- Parameter formats vary (sometimes uses `|`, sometimes `,`, sometimes neither)

**Potential fix:** More explicit format constraints in prompt, or more robust parsing.

### 2. Mobile Responsiveness
Not tested on mobile. Fixed-width grid columns may break on small screens.

### 3. Engagement Gate
The "like and retweet to unlock" gate exists in the UI but:
- No actual Twitter/X API integration
- Gate logic is placeholder (`lib/session.ts`)

### 4. Session Persistence
Sessions are cookie-based only. No database. Conversation history is lost on cookie expiry.

### 5. Error Handling
Basic error handling exists but could be more graceful:
- No retry logic for failed API calls
- No timeout handling mid-stream

### 6. Structured JSON Blocks
The ````equilibrium` and ````analysis` JSON blocks:
- Model sometimes doesn't include them
- Would need prompt reinforcement to make consistent
- Current UI handles missing blocks gracefully

### 7. Testing
No test coverage.

---

## Environment Variables

```env
ANTHROPIC_API_KEY=sk-ant-...
```

That's the only required env var.

---

## Running Locally

```bash
npm install
npm run dev
```

Runs on `http://localhost:3000`

---

## Key Design Decisions

### Why `<thinking>` tags?
The model needs to show its formal work, but users shouldn't see raw math by default. The `<thinking>` block:
- Contains the full formal analysis
- Is hidden by default behind "Reasoned formally" toggle
- Gets styled when expanded

### Why ASCII format in thinking?
JSON would be cleaner to parse, but:
- Model produces more natural formal analysis in ASCII
- ASCII is more human-readable in raw form
- Parser handles the transformation

### Why stream then parse?
Alternative would be to wait for full response then parse. Current approach:
- Shows response immediately (better UX)
- Parses JSON blocks only after stream complete
- Handles incomplete blocks during stream

---

## Calibration Points

If you want to tune the model behavior, key areas:

1. **Directness** — Part 5 of prompt (lines 883-922) controls when to hedge vs be direct
2. **Extension priority** — Part 2 lists extensions; order suggests importance
3. **Output length** — "Default (3-5 paragraphs)" in Part 4
4. **Behavioral parameters** — λ_PT = 2.25, etc. in Part 3

To change the model:
```typescript
// app/api/chat/route.ts, line 51
model: anthropic("claude-sonnet-4-20250514")
// Change to opus, haiku, or different version
```

---

## File Tree (Key Files)

```
LOVE.WORKS/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Claude API, streaming, parsing
│   ├── layout.tsx
│   └── page.tsx                  # Main chat page
├── components/
│   ├── chat/
│   │   ├── AIMessage.tsx         # Renders AI responses
│   │   ├── MessageList.tsx       # Message container
│   │   ├── TypingIndicator.tsx   # Loading animation
│   │   └── UserMessage.tsx
│   ├── equilibrium/
│   │   ├── EquilibriumCard.tsx   # Prediction card
│   │   ├── FormalAnalysis.tsx    # Toggle + structured data
│   │   ├── ProbabilityRow.tsx    # Probability bars
│   │   └── ThinkingBlock.tsx     # Parses/styles thinking
│   └── ui/
│       └── ...                   # Generic UI components
├── hooks/
│   └── useChat.ts                # Chat state management
├── lib/
│   ├── constants.ts              # UI copy, config
│   ├── session.ts                # Cookie session handling
│   └── system-prompt.ts          # THE MODEL (~1500 lines)
└── tailwind.config.ts            # Custom animations
```

---

## Contact

Built by Lauris Zeminsky (@lzminsky)
