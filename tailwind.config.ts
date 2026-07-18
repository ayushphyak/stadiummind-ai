import type { Config } from "tailwindcss";

// Design system: "stadium at night, floodlights on".
// Named tokens per frontend-design principles — every color has a job,
// not a generic role. Amber/red are reserved exclusively for live
// operational alerts so they retain meaning wherever they appear.
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pitch: {
          DEFAULT: "#0B1220", // deep stadium-night navy — primary background
          surface: "#121A2B", // elevated card surface
          line: "#1E293B", // hairline dividers, borders
        },
        turf: {
          DEFAULT: "#2F9E5C", // primary brand accent — pitch green
          bright: "#3FC172",
          muted: "#1F6B40",
        },
        floodlight: {
          DEFAULT: "#F5F7FA", // primary text on dark surfaces
          dim: "#AEB9CC",
        },
        alert: {
          amber: "#F5A623", // caution / medium congestion
          red: "#E5484D", // danger / high congestion, incidents
          info: "#3B82F6",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"], // Space Grotesk
        body: ["var(--font-body)", "sans-serif"], // Inter
        mono: ["var(--font-data)", "monospace"], // IBM Plex Mono — live stats
      },
      borderRadius: {
        card: "0.75rem",
      },
      keyframes: {
        pulseRing: {
          "0%": { transform: "scale(0.9)", opacity: "0.8" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
      },
      animation: {
        pulseRing: "pulseRing 1.8s cubic-bezier(0.4,0,0.6,1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
