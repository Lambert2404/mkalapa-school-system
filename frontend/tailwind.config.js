/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F3F4EF",
        surface: "#FFFFFF",
        ink: "#1B211D",
        muted: "#5B6459",
        border: "#E1E3DA",
        forest: {
          50: "#EAF0EC",
          100: "#CFDDD4",
          300: "#6E9A80",
          500: "#2C5C43",
          600: "#204A35",
          700: "#16332A",
          900: "#0D1F19",
        },
        maize: {
          50: "#FBF3DD",
          200: "#F0D488",
          400: "#DDAE2E",
          500: "#C99A1F",
          600: "#A67D16",
        },
        brick: {
          50: "#F8E9E4",
          200: "#E4A793",
          500: "#B3412C",
          600: "#8F3223",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(22, 51, 42, 0.06), 0 1px 8px rgba(22, 51, 42, 0.05)",
      },
      borderRadius: {
        xl: "10px",
      },
    },
  },
  plugins: [],
}
