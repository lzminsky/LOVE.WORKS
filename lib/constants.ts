// Copy constants
export const COPY = {
  welcomeModal: {
    tagline: "bounded.works presents",
    title: "lovebomb.works",
    description: "The same models used for pricing options and predicting markets.",
    cta: "Now pointed at your love life.",
  },
  onboarding: `Think of me as that neurodivergent friend who clocks what's actually happening while everyone else is still making excuses. I'll be honest, but I actually give a shit.

People come here with things like:

"We've been dating for 8 months and he still says he's not ready for a relationship. He was hurt by his ex. I think he just needs more time."

"She moved in 6 months ago and now she's completely different. Cold, distant, picks fights over nothing."

"I found texts from his coworker. When I brought it up he said I was being insecure and controlling."

I'll ask a few questions to understand the full picture, then tell you what's actually happening and what's likely to happen next.`,
  gate: {
    title: "You've hit your limit",
    description: "To unlock unlimited access, like and retweet this post.",
    subtext: "That's it—no payment, no tricks.",
    footer: "Just help spread the word if you found this useful.",
  },
  about: {
    intro: `This is a formal economic model for understanding relationship dynamics. The math applies capital markets and preference-maximization theory for computing through relationship issues.`,
    description: `It uses game theory, mechanism design, and behavioral economics to diagnose what's actually happening in your situation. Not fear or hope, but what the incentives and equilibria actually predict.`,
    tagline: "This is not a blackpill. There is a way out, and it's called love.",
    framework: `We apply ICAPM (Merton) + VRP + several extensions on top of utility-preference functions that leverage bounded rationality, prospect theory, time-sensitivity and sunk-costs. All of the stuff that we unconsciously and consciously think about when navigating the world.`,
  },
  errors: {
    timeout: {
      title: "Taking longer than usual",
      message: "The analysis is still processing. Please wait...",
    },
    api_error: {
      title: "Something went wrong",
      message: "We couldn't complete the analysis. Please try again.",
    },
    twitter_error: {
      title: "Couldn't verify engagement",
      message: "We couldn't check your like/retweet status.",
    },
    rate_limit: {
      title: "Slow down",
      message: "Wait a moment before sending another message.",
    },
    session_expired: {
      title: "Session expired",
      message: "Starting a fresh conversation.",
    },
  },
} as const;

// Extensions list for About panel
export const EXTENSIONS = [
  "I. Option Pricing",
  "II. Information Asymmetry",
  "III. Mechanism Design",
  "IV. Principal-Agent",
  "V. Credit Rationing",
  "VI. Hold-Up",
  "VII. Bargaining",
  "VIII. Contract Incompleteness",
  "IX. Tournament Effects",
  "X. Repeated Games",
] as const;

// Links
export const LINKS = {
  boundedWorks: "https://bounded.works",
  modelPdf: "https://www.bounded.works/Commitment_Market_Dynamics_v2.pdf",
  twitter: "https://twitter.com/lzminsky",
  twitterHandle: "@lzminsky",
} as const;

// App config
export const CONFIG = {
  maxFreeMessages: 10,
  messageLimitEnabled: false, // Set to true to enable message gating
  appName: "lovebomb.works",
  parentOrg: "bounded.works",
} as const;

// Mock data for development
export const MOCK_PREDICTIONS = [
  { outcome: "Status quo continues", probability: 65, level: "high" as const },
  { outcome: "He fades out", probability: 20, level: "medium" as const },
  { outcome: "She exits", probability: 12, level: "low" as const },
  { outcome: "He commits", probability: 3, level: "minimal" as const },
];

export const MOCK_EQUILIBRIUM = {
  id: "EQ-001",
  name: "Situationship Steady State",
  description: "A stable equilibrium where he extracts value while preserving optionality.",
  confidence: 70,
  predictions: MOCK_PREDICTIONS,
};

export const MOCK_AI_RESPONSE = `This is a classic situationship structure. He's keeping you in the zone between his casual threshold and his commitment threshold—close enough that you stay, far enough that he preserves optionality.

The daily texting is low-cost maintenance. It keeps you engaged without requiring actual investment. The weekend avoidance is the tell: weekends are when real couples do things. He's protecting that time for optionality—either other options, or just the freedom to have them.

The bar stories while claiming "busy with work" is information leakage. He's not even hiding it well, which suggests he's not that worried about losing you. That tells you something about how he's pricing your exit threat.`;

export const MOCK_FORMAL_ANALYSIS = {
  parameters: [
    { param: "MP_M", value: "60-75th %ile", basis: "Active social life, multiple options" },
    { param: "MP_F", value: "55-70th %ile", basis: "Maintained but not prioritized" },
    { param: "T_commit", value: "> her MP_F", basis: "No commitment signals" },
    { param: "T_casual", value: "< her MP_F", basis: "Maintained contact" },
  ],
  extensions: [
    {
      id: "EXT-V",
      name: "Credit Rationing",
      status: "ACTIVE" as const,
      detail: "He's rationing commitment. Q_commit = 0 for her.",
    },
    {
      id: "EXT-IX",
      name: "Tournament Effects",
      status: "LIKELY" as const,
      detail: "Weekend bar activity suggests active market participation.",
    },
  ],
};

// Tweet preview data
export const TWEET_PREVIEW = {
  author: "Lauris Zeminsky",
  handle: "@lzminsky",
  content: `I got dumped, so I built a variance risk premium model to understand dating markets.

Here's the formal economics definition of love ↓`,
  likes: "12.4k",
  retweets: "3.2k",
};
