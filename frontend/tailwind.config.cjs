const { heroui } = require("@heroui/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Özel paletinizi Tailwind sınıfları olarak ekliyoruz
        portfolio: {
          bg: "#0B1120",
          sky: "#38BDF8",
          purple: "#818CF8",
          card: "#1E293B",
          slate: "#94A3B8",
          white: "#F8FAFC",
        }
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        dark: {
          colors: {
            background: "#0B1120", // Ana arka plan
            primary: {
              DEFAULT: "#38BDF8", // Sky Blue
              foreground: "#0B1120",
            },
            secondary: {
              DEFAULT: "#818CF8", // Soft Purple
              foreground: "#F8FAFC",
            },
            content1: "#1E293B", // Kartların arka planı (HeroUI default)
          },
        },
      },
    }),
  ],
};