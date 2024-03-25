import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "sinister-red-900": "#330a0a",
        "sinister-red-500": "#BB2222",
        "sinister-red-300": "#CC4444",
      },
      backgroundImage: {
        "sinister-radial-gradient":
          "radial-gradient(circle farthest-side at bottom center, hsl(0 69% 10% / 1), #000)",
        "sinister-text-gradient":
          "radial-gradient(#BB2222, hsl(0 69% 30% / 1))",
      },
      screens: {
        "3xl": "1920px",
      },
    },
  },
  plugins: [],
} satisfies Config;
