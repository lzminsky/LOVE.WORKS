import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        surface: "#1a1a1a",
        "surface-hover": "#252525",
        text: "#e5e5e5",
        muted: "#737373",
        "muted-dark": "#525252",
        "muted-darker": "#3f3f3f",
        accent: "#d4a574",
        "accent-hover": "#e0b385",
        error: "#ef4444",
        success: "#4ade80",
        warning: "#fbbf24",
      },
      fontFamily: {
        sans: ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        mono: ['var(--font-mono)', '"SF Mono"', 'ui-monospace', 'monospace'],
      },
      animation: {
        "slide-in": "slideIn 0.2s ease-out",
        "pulse-dot": "pulseDot 1.4s ease-in-out infinite",
        "spin": "spin 1s linear infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "pulse-opacity": "pulseOpacity 2s ease-in-out infinite",
        "blink": "blink 0.8s step-end infinite",
      },
      keyframes: {
        slideIn: {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        pulseDot: {
          "0%, 80%, 100%": { opacity: "0.3", transform: "scale(0.8)" },
          "40%": { opacity: "1", transform: "scale(1)" },
        },
        pulseGlow: {
          "0%, 100%": {
            boxShadow: "0 0 0 0 rgba(212, 165, 116, 0.2)",
            transform: "scale(1)",
          },
          "50%": {
            boxShadow: "0 0 20px 4px rgba(212, 165, 116, 0.15)",
            transform: "scale(1.05)",
          },
        },
        pulseOpacity: {
          "0%, 100%": { opacity: "0.7" },
          "50%": { opacity: "1" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
    },
  },
  plugins: [typography],
};

export default config;
