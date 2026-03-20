import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#f4efe6",
        ink: "#1f2937",
        accent: "#d97706",
        accentDark: "#92400e",
        board: "#fffdf8",
        line: "#d6c7ae",
      },
      boxShadow: {
        panel: "0 18px 60px rgba(74, 58, 33, 0.14)",
      },
    },
  },
  plugins: [],
};

export default config;
