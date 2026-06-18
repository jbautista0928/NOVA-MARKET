import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        nova: {
          black: "#0a0a0a",
          blue: "#2563eb",
          gold: "#f59e0b",
        },
      },
    },
  },
  plugins: [],
};
export default config;
