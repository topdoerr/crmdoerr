import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Preserved from original Perfex theme
        forest: {
          50: "#f5f6f4",
          100: "#e8ebe5",
          200: "#d1d7cc",
          300: "#aab39f",
          400: "#7d8a6e",
          500: "#5c6b4e",
          600: "#283618",
          700: "#222f15",
          800: "#1A2410",
          900: "#151c0d",
          950: "#0c1008",
        },
        olive: {
          50: "#f4f5f0",
          100: "#e6e9dc",
          200: "#cfd6b8",
          300: "#b0bc8f",
          400: "#8f9d68",
          500: "#7A8A4A",
          600: "#606C38",
          700: "#4a5630",
          800: "#3e462a",
          900: "#363d28",
          950: "#1c2113",
        },
        amber: {
          50: "#fcf6ef",
          100: "#f8e9d6",
          200: "#efd0ae",
          300: "#e3af7c",
          400: "#d99552",
          500: "#D4822E",
          600: "#BC6C25",
          700: "#9c5520",
          800: "#7f451f",
          900: "#683a1c",
          950: "#3a1d0d",
        },
        brand: {
          50: "#f9f2f2",
          100: "#f0e0e0",
          200: "#e2c4c4",
          300: "#cf9e9e",
          400: "#b86a6a",
          500: "#a84848",
          600: "#8B2E2E",
          700: "#732727",
          800: "#612424",
          900: "#522323",
          950: "#2c1010",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
