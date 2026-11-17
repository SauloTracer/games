import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#16233F",
        "ink-soft": "#2B4C8C",
        muted: "#4A5568",
        subtle: "#5A6478",
        ground: "#F4F5F9",
        surface: "#FFFFFF",
        line: "#E3E6EE",
        "line-strong": "#D5DAE5",
        chip: "#EEF1F7",
        sudoku: { DEFAULT: "#F5B83D", soft: "#FFF1D1", ink: "#6B4500" },
        snake: { DEFAULT: "#2FB37A", soft: "#DDF5EA", ink: "#0F5236" },
        slide: { DEFAULT: "#EE6A6A", soft: "#FDE2E2", ink: "#7A1E24" },
        tetris: { DEFAULT: "#3BA7D9", soft: "#DCEFF8", ink: "#0B4560" },
      },
      fontFamily: {
        display: ["var(--font-display)", "Bricolage Grotesque", ...defaultTheme.fontFamily.sans],
        sans: ["var(--font-sans)", "Inter", ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        card: "0 24px 60px rgba(22, 35, 63, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
