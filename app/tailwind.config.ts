import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "sinister-red-900": "hsl(0 69% 10% / 1)",
        "sinister-red-700": "hsl(0 69% 30% / 1)",
        "sinister-red-500": "hsl(0 69% 43% / 1)",
        "sinister-red-300": "#CC4444",
        "rsi-blue-100": "#7ef8ff",
        "rsi-blue-200": "#56a6b6",
        "rsi-blue-300": "#0e2635",
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
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;
