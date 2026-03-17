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
        background: "var(--background)",
        surface: "var(--surface)",
        "surface-hover": "var(--surface-hover)",
        text: "var(--text)",
        muted: "var(--muted)",
        "muted-dark": "var(--muted-dark)",
        "muted-darker": "var(--muted-darker)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        error: "var(--error)",
        success: "var(--success)",
        warning: "var(--warning)",
      },
      fontFamily: {
        sans: ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        mono: ['var(--font-mono)', '"SF Mono"', 'ui-monospace', 'monospace'],
        'serif-display': ['var(--font-serif-display)', 'Georgia', 'serif'],
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
