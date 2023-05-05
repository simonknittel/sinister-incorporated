import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "sinister-red-500": "#BB2222",
        "sinister-red-300": "#CC4444",
      },
      backgroundImage: {
        "sinister-gradient": "linear-gradient(145deg, #181818, #202020)",
      },
    },
  },
  plugins: [],
} satisfies Config;
