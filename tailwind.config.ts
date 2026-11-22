import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0A0A0A", surface: "#141414", surface2: "#1E1E1E", line: "#2A2A2A",
        gold: { DEFAULT: "#F5B800", soft: "#FACC15" },
        fire: { DEFAULT: "#E11D48", deep: "#DC2626" },
        muted: "#A1A1AA",
      },
      fontFamily: { display: ["var(--font-display)", "Impact", "sans-serif"], sans: ["var(--font-body)", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
} satisfies Config;
