module.exports = {
  darkMode: "class",
  important: true,
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Georgia", "serif"],
      },
      colors: {
        ink: "#111111",
        fog: "#f7f4ef",
        clay: "#b96852",
      },
      boxShadow: {
        soft: "0 18px 50px rgba(17, 17, 17, 0.08)",
      },
    },
  },
  plugins: [],
};
