/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#070320ff",
        secondary: "#151312",
        light:{
          100: "#E5E7EB",
          200: "#D1D5DB",
          300: "#9CA3AF",
        },
        dark: {
          100: "#374151",
          200: "#1F2937",
          300: "#111827",
        },
        accent: "#8486e6ff",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Merriweather", "serif"],
      },
    },
  },
  plugins: [],
}