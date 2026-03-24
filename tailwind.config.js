/** @type {import('tailwindcss').Config} */

const colors = require("tailwindcss/colors");

const forest = {
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
};

const olive = {
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
};

const amber = {
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
};

const brandRed = {
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
};

module.exports = {
  content: [
    "./application/views/admin/*.php",
    "./application/views/admin/**/*.php",
    "./application/views/authentication/*.php",
    "./application/views/authentication/**/*.php",
    "./application/views/themes/**/*.php",
    "./application/views/themes/**/**/*.php",
    "./application/views/**/*.php",
    "./modules/**/views/*.php",
    "./modules/**/views/**/*.php",
    "./assets/js/main.js",
    "./assets/js/projects.js",
    "./assets/js/tickets.js",
    "./assets/js/app.js",
    "./assets/js/map.js",
    "./install/*.php",
    "./resources/js/**/*.vue",
  ],
  safelist: [
    {
      pattern:
        /^panel|btn-|bg-|text-|label-|badge-|bg-|dropdown|nav-|nav-tabs|pagination-|fc-|alert-.*/,
    },
  ],
  prefix: "tw-",
  theme: {
    extend: {
      fontSize: {
        sm: "0.8rem",
        base: "0.9rem",
        normal: "0.84375rem",
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
      },
    },
    colors: {
      transparent: "transparent",
      inherit: colors.inherit,
      current: "currentColor",

      black: colors.black,
      white: colors.white,

      neutral: {
        50: "#fafaf8",
        100: "#F4F4F2",
        200: "#e8e8e4",
        300: "#D0D1AC",
        400: "#A8A99A",
        500: "#6B7052",
        600: "#5a5e47",
        700: "#4a4d3c",
        800: "#2d3128",
        900: "#1A1F0E",
        950: "#0f1209",
      },
      danger: brandRed,
      warning: amber,
      success: olive,
      info: forest,
      primary: forest,
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
