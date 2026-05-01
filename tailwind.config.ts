import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand v2 palette
        cream: {
          DEFAULT: "#F5F4EE",
          50: "#FAFAF8",
          100: "#F5F4EE",
          200: "#EDECE3",
          300: "#E2E0D3",
        },
        forest: {
          DEFAULT: "#1C1C14",
          50: "#F5F5F3",
          100: "#E8E8E3",
          200: "#CDCDC2",
          300: "#9A9A88",
          400: "#6B6B56",
          500: "#3D3D2E",
          600: "#1C1C14",
          700: "#161610",
          800: "#10100C",
          900: "#0A0A08",
          950: "#050504",
        },
        amber: {
          DEFAULT: "#B5621E",
          50: "#FDF5EE",
          100: "#F9E5D3",
          200: "#F0C6A0",
          300: "#E4A06A",
          400: "#D57D3E",
          500: "#B5621E",
          600: "#9A5219",
          700: "#7D4215",
          800: "#633512",
          900: "#4E2A0F",
          950: "#2B1708",
        },
        olive: {
          DEFAULT: "#5C6B2E",
          50: "#F4F6EE",
          100: "#E5EAD6",
          200: "#C9D4AA",
          300: "#A5B676",
          400: "#839950",
          500: "#5C6B2E",
          600: "#4D5A27",
          700: "#3E4820",
          800: "#313919",
          900: "#272E15",
          950: "#15190B",
        },
        "body-gray": "#4A4A3A",
        "brand-muted": "#8A8A72",
        "border-soft": "#D8D6C8",
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
