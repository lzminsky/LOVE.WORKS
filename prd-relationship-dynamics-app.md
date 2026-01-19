# Product Requirements Document: lovebomb.works

**A bounded.works product**

## Overview

A web application that provides formal economic analysis of relationship dynamics using an ICAPM-VRP framework. Users interact with an AI advisor that diagnoses their situations through rigorous game-theoretic modeling, delivering insights in accessible natural language with optional formal mathematical exposition.

**Core Value Proposition:** "Get your relationship dynamics diagnosed by a formal economic model—the same framework that predicted my own situation correctly."

**Domain:** lovebomb.works
**Parent org:** bounded.works

---

## Product Decisions Summary

| Decision | Choice |
|----------|--------|
| Free prompts | 10 |
| Gate requirement | Like AND Retweet |
| Post-unlock access | Unlimited forever |
| Conversation model | Single thread per user |
| History persistence | Ephemeral (session-based) |
| Export | Yes |
| Auth requirement | Anonymous until limit, then Twitter |
| Target tweet | Main article |
| Monetization | None |
| Analytics | Posthog |

---

## Technical Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Frontend | Next.js 14 (App Router) | React framework, Vercel-optimized |
| Deployment | Vercel | Hosting, edge functions, analytics |
| Database | Supabase | User state, prompt counts, session management |
| Auth | Supabase Auth + Twitter OAuth 2.0 | Identity, social verification |
| LLM | Claude API (Sonnet 4) | Relationship analysis engine |
| Analytics | Posthog | User behavior, funnel analysis |
| Rate Limiting | Upstash Redis | Abuse prevention |

---

## User Flows

### Flow 1: Anonymous User (First Visit)

```
Landing Page
    ↓
[Start Analysis] button
    ↓
Onboarding: "Describe a past relationship. Present tense..."
    ↓
Chat interface (anonymous session)
    ↓
Prompt counter visible: "9 messages remaining"
    ↓
... continues until prompt 10 ...
    ↓
Gate screen: "You've hit your 10 free messages..."
    ↓
Twitter OAuth flow
    ↓
Verify like + RT
    ↓
Unlimited access unlocked
```

### Flow 2: Returning Unlocked User

```
Landing Page
    ↓
[Continue] or [Start New]
    ↓
Chat interface (unlimited)
```

### Flow 3: Export/Share

```
During or after conversation
    ↓
[Export Analysis] button
    ↓
Generate shareable card/image
    ↓
Options: Download PNG | Copy Link | Share to Twitter
```

---

## Core Features

### 1. Chat Interface

**Requirements:**
- Single-thread conversation per session
- Message input with send button
- Streaming responses from Claude API
- Markdown rendering for responses
- "Show formal analysis" toggle/button per response
- Prompt counter (for ungated users)
- Mobile-responsive design

**UI States:**
- Empty state (onboarding prompt)
- Active conversation
- Loading/streaming
- Error state
- Gate reached state

### 2. Onboarding Experience

**The Heideggerian Hook:**

First message from the system:
> "Describe a past relationship. Present tense. I'll tell you how it ended—and it'll help me learn more about you. Or, we can talk about anything you want."

**Purpose:**
- User describes past situation in present tense
- Model analyzes and predicts outcome
- User sees prediction matches reality
- Trust established → user brings current situation
- Alternative path: user skips calibration, goes direct to current issue

**Implementation:**
- System message triggers on conversation start
- User can skip calibration if they prefer
- After user describes past situation, model provides analysis with prediction
- Implicit validation: user recognizes the model "got it right"

### 3. Gate Mechanism

**Trigger:** 10th prompt submitted by ungated user

**Gate Screen Content:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You've hit your 10 free messages.

To unlock unlimited access, like and retweet this post:

[embedded tweet preview]

That's it—no payment, no tricks. 
Just help spread the word if you found this useful.

[Connect Twitter]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Technical Flow:**
1. User clicks "Connect Twitter"
2. Twitter OAuth 2.0 flow (scopes: `tweet.read`, `users.read`, `like.read`)
3. On callback, store Twitter user ID in Supabase
4. Check if user has liked AND retweeted target tweet
5. If yes → set `unlocked = true` in DB
6. If no → show "Please like and retweet to continue" with refresh button

**Edge Cases:**
- User unlikes/un-retweets later: Don't revoke (honor the unlock)
- Twitter API fails: Show error, allow retry, log for monitoring
- User already follows but hasn't engaged: Still require like + RT

### 4. Export/Share Feature

**Shareable Diagnosis Card:**

Generate an image containing:
- Summary of situation (anonymized/abstracted)
- Key dynamics identified
- Equilibrium name
- Prediction with confidence
- App branding/URL

**Format:** 1200x630 PNG (Twitter card optimized)

**Privacy Controls:**
- User reviews card before sharing
- Option to edit/redact before export
- No automatic sharing—always user-initiated

**Share Options:**
- Download PNG
- Copy shareable link (generates unique URL with card preview)
- "Share to Twitter" (pre-filled tweet with card)

### 5. Conversation Reset

**Trigger:** User clicks "Start New" button

**Flow:**
1. If conversation has content → prompt: "Export this conversation before starting fresh?"
2. If yes → generate export, then clear
3. If no → clear immediately
4. Restart with onboarding message

**Implementation:**
- "Start New" button always visible in header
- Export modal appears if conversation exists
- Session cleared, new session token generated
- Prompt count does NOT reset (lifetime limit for ungated users)

### 6. Formal Analysis Mode

**Toggle:** "Show me the math" button on any response

**Renders:**
- Full parameter tables
- Equations with LaTeX rendering (KaTeX)
- Extension-by-extension breakdown
- Prediction table with probabilities

**Implementation:**
- Claude generates both natural language and formal analysis
- Formal version stored but hidden by default
- Toggle reveals formal section below natural language response

### 7. Visual Design

**Theme:** Dark mode default

**Palette:**
- Background: Near-black (#0a0a0a)
- Surface: Dark gray (#1a1a1a)  
- Text: Off-white (#e5e5e5)
- Accent: Amber/gold (#d4a574)
- Secondary accent: Muted gold (#b8956e)

**Typography:**
- Clean sans-serif (Inter or similar)
- Generous line height (1.6)
- Large enough for long-form reading (16-18px body)

**Principles:**
- Minimal chrome—conversation is the product
- No visual clutter
- Breathing room around messages
- Smooth animations, nothing jarring
- Mobile-first responsive

**References:**
- Claude.ai (clean, conversational)
- Linear (minimal, functional)
- Perplexity (conversation-first, dark mode)

**NOT:**
- ChatGPT (too corporate)
- Replika (too cutesy)
- Dating apps (wrong associations)

---

## Data Model (Supabase)

### Tables

**users**
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
twitter_id      text UNIQUE
twitter_handle  text
created_at      timestamp DEFAULT now()
unlocked        boolean DEFAULT false
unlocked_at     timestamp
prompt_count    integer DEFAULT 0
```

**sessions**
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id         uuid REFERENCES users(id)  -- nullable for anonymous
session_token   text UNIQUE
created_at      timestamp DEFAULT now()
last_active     timestamp DEFAULT now()
prompt_count    integer DEFAULT 0
```

**Note:** Conversations are ephemeral—not stored in DB. Only session metadata persists.

### Anonymous User Handling

- Generate session token (stored in cookie)
- Track prompt count in `sessions` table
- On Twitter auth, merge session into user record
- Prompt count transfers to user record

---

## API Routes

### `/api/chat`
- POST: Send message, receive streaming response
- Headers: session token
- Body: `{ message: string, showFormal?: boolean }`
- Returns: SSE stream of response chunks
- Side effect: Increment prompt count

### `/api/auth/twitter`
- GET: Initiate Twitter OAuth flow
- Redirects to Twitter authorization

### `/api/auth/twitter/callback`
- GET: Handle OAuth callback
- Creates/updates user record
- Verifies like + RT status
- Sets session cookie

### `/api/verify-engagement`
- POST: Check if user has liked + RT'd target tweet
- Returns: `{ liked: boolean, retweeted: boolean, unlocked: boolean }`

### `/api/export`
- POST: Generate shareable card
- Body: `{ conversationSummary: string }`
- Returns: `{ imageUrl: string, shareUrl: string }`

---

## Environment Variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Claude API
ANTHROPIC_API_KEY=

# Twitter API
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
TWITTER_TARGET_TWEET_ID=

# Posthog
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# Upstash Redis (rate limiting)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# App
NEXT_PUBLIC_APP_URL=
```

---

## Rate Limiting

**Anonymous users:**
- 10 prompts lifetime (enforced by gate)
- 1 prompt per 5 seconds (prevent spam)

**Authenticated unlocked users:**
- 60 prompts per hour
- 1 prompt per 3 seconds

**Implementation:** Upstash Redis with sliding window

---

## Analytics Events (Posthog)

| Event | Properties | Purpose |
|-------|------------|---------|
| `page_view` | `page`, `referrer` | Traffic source |
| `conversation_started` | `source` | Onboarding funnel |
| `message_sent` | `prompt_number`, `is_gated` | Usage patterns |
| `gate_reached` | `prompt_count` | Conversion funnel |
| `twitter_auth_started` | — | Auth funnel |
| `twitter_auth_completed` | `already_engaged` | Auth funnel |
| `engagement_verified` | `liked`, `retweeted` | Gate conversion |
| `unlocked` | `time_to_unlock` | Gate success |
| `formal_analysis_requested` | `prompt_number` | Feature usage |
| `export_generated` | `share_method` | Viral features |
| `share_completed` | `platform` | Viral loop |

---

## Error Handling

| Error | User Message | Technical Action |
|-------|--------------|------------------|
| Claude API timeout | "Taking longer than usual. Please wait..." | Retry with backoff |
| Claude API error | "Something went wrong. Try again." | Log, alert if persistent |
| Twitter API failure | "Couldn't verify your engagement. Please try again." | Log, show retry button |
| Rate limited | "Slow down! Wait a moment before sending." | Show cooldown timer |
| Session expired | "Session expired. Starting fresh." | Create new session |

---

## Security Considerations

1. **Session tokens:** HTTP-only cookies, secure flag, SameSite=Lax
2. **API routes:** Validate session on every request
3. **Rate limiting:** Prevent abuse before it costs money
4. **Twitter verification:** Server-side only (don't trust client claims)
5. **No PII storage:** Conversations not persisted, minimal user data
6. **CORS:** Restrict to app domain only

---

## Backend/Infrastructure Setup Guide

### 1. Database Setup (Supabase)

**Create tables:**
```sql
-- users table
CREATE TABLE users (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  twitter_id      text UNIQUE,
  twitter_handle  text,
  created_at      timestamp DEFAULT now(),
  unlocked        boolean DEFAULT false,
  unlocked_at     timestamp,
  prompt_count    integer DEFAULT 0
);

-- sessions table
CREATE TABLE sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES users(id),  -- nullable for anonymous
  session_token   text UNIQUE,
  created_at      timestamp DEFAULT now(),
  last_active     timestamp DEFAULT now(),
  prompt_count    integer DEFAULT 0
);

-- indexes
CREATE INDEX idx_sessions_token ON sessions(session_token);
CREATE INDEX idx_users_twitter_id ON users(twitter_id);
```

**RLS Policies:** Required for both tables. Sessions should be accessible only by matching session_token. Users table accessed via service role key only.

---

### 2. External Services Setup

| Service | Setup Required | Credentials Needed |
|---------|----------------|-------------------|
| **Supabase** | Create project, run SQL above, enable RLS | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| **Twitter API** | Apply for elevated access (like.read scope), create OAuth 2.0 app | `TWITTER_CLIENT_ID`, `TWITTER_CLIENT_SECRET` |
| **Claude API** | Get API key, ensure Sonnet 4 access | `ANTHROPIC_API_KEY` |
| **Upstash Redis** | Create Redis database, get REST credentials | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` |
| **Posthog** | Create project, get project key | `POSTHOG_KEY`, `POSTHOG_HOST` |
| **Vercel** | Create project, connect repo, configure env vars | Deploy target |

---

### 3. API Routes Implementation

| Route | Method | Input | Output | Side Effects |
|-------|--------|-------|--------|--------------|
| `/api/chat` | POST | `{ message, showFormal? }` + session cookie | SSE stream | Increment prompt_count |
| `/api/auth/twitter` | GET | — | Redirect to Twitter | — |
| `/api/auth/twitter/callback` | GET | OAuth code | Redirect to app | Create/update user, set cookie |
| `/api/verify-engagement` | POST | session cookie | `{ liked, retweeted, unlocked }` | Update unlocked status |
| `/api/export` | POST | `{ conversationSummary }` | `{ imageUrl, shareUrl }` | — |

**Route implementation order:**
1. Session middleware (cookie handling)
2. `/api/chat` (core functionality)
3. `/api/auth/twitter` + callback (gate unlock)
4. `/api/verify-engagement` (gate check)
5. `/api/export` (viral feature)

---

### 4. Rate Limiting Implementation (Upstash)

```typescript
// Sliding window rate limiting
const rateLimits = {
  anonymous: {
    lifetime: 10,        // total prompts ever
    perSecond: 0.2       // 1 per 5 seconds
  },
  unlocked: {
    perHour: 60,         // 60 per hour
    perSecond: 0.33      // 1 per 3 seconds
  }
};
```

Check rate limit BEFORE calling Claude API (cost protection).

---

### 5. Session Flow

```
First visit:
  → Generate session_token (uuid)
  → Set HTTP-only cookie
  → Create sessions row (user_id = null)
  → Track prompt_count in sessions table

On Twitter auth:
  → Create/get users row with twitter_id
  → Update sessions.user_id to link
  → Transfer prompt_count to users table
  → Set unlocked = true if engagement verified

Returning visit:
  → Read session_token from cookie
  → Look up session → user
  → Check unlocked status
```

---

### 6. Blocking Dependencies

| Dependency | Lead Time | Status | Notes |
|------------|-----------|--------|-------|
| Twitter API elevated access | 24-48 hours | **APPLY IMMEDIATELY** | Required for `like.read` scope |
| Domain (lovebomb.works) | Minutes | Check availability | Purchase and configure DNS |
| Target tweet | — | Create before launch | Need `TWITTER_TARGET_TWEET_ID` |

---

### 7. Setup Priority Order

1. **Twitter Developer Portal** — Apply for elevated access (bottleneck, do first)
2. **Supabase** — Create project, run SQL, configure RLS
3. **Vercel** — Create project, connect GitHub repo
4. **Upstash** — Create Redis instance
5. **Posthog** — Create project
6. **Environment variables** — Wire all credentials in Vercel
7. **API routes** — Build in order above
8. **Frontend integration** — Connect UI to APIs

---

## Launch Checklist

### Pre-launch
- [ ] Twitter API access approved (elevated access for like/RT read)
- [ ] Target tweet created and ID configured
- [ ] System prompt finalized and tested
- [ ] Rate limits tested under load
- [ ] Error states all have UI
- [ ] Mobile responsive tested
- [ ] Posthog events firing correctly
- [ ] Export card generation working
- [ ] Share flow tested end-to-end

### Launch Day
- [ ] Article posted
- [ ] Tweet ID updated in config
- [ ] Monitoring dashboards ready
- [ ] Error alerting configured
- [ ] Prepared for traffic spike

---

## Resolved Decisions

| Question | Decision |
|----------|----------|
| App name/domain | lovebomb.works (by bounded.works) |
| Onboarding copy | "Describe a past relationship. Present tense. I'll tell you how it ended—and it'll help me learn more about you. Or, we can talk about anything you want." |
| Gate tone | Direct, fair trade framing |
| Twitter API fallback | Block + retry button |
| Conversation reset | Yes, with export prompt before clearing |
| Visual direction | Dark mode, minimal, amber/gold accent |

---

## Timeline Estimate

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Setup | 4 hours | Repo, Vercel, Supabase, env vars |
| Auth flow | 6 hours | Twitter OAuth, session management |
| Chat interface | 8 hours | UI, Claude integration, streaming |
| Gate mechanism | 4 hours | Prompt counting, gate UI, verification |
| Export/share | 4 hours | Card generation, share flow |
| Polish | 6 hours | Mobile, error states, edge cases |
| Testing | 4 hours | End-to-end, load testing |

**Total:** ~36 hours focused work → 4-5 days with breaks

---

## Future Considerations (Not MVP)

- Conversation history (opt-in persistence)
- Multiple saved conversations
- "Compare your situation to similar cases"
- Relationship trajectory tracking over time
- Partner mode (both parties use the tool)
- API for third-party integration
