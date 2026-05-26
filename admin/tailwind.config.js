/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        accent: "#A3FF12",
        dark: "#000000",
        surface: "#0D0D0D",
        card: "#111111",
        border: "#1E1E1E",
        muted: "#555555"
      },
      fontFamily: {
        mono: ["'Space Mono'", "monospace"],
        sans: ["'DM Sans'", "sans-serif"]
      }
    }
  },
  plugins: []
}
