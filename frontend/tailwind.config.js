/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        slo: {
          green: "#2d6a4f",
          brown: "#8b5e3c",
          sky: "#4a9eca",
          sand: "#f4e4c1",
        },
      },
    },
  },
  plugins: [],
};
