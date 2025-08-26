/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/main/resources/static/**/*.html",
    "./src/main/resources/static/js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        'brand-brown': '#8B4513',
        'brand-brown-light': '#A0522D',
        'brand-brown-dark': '#654321',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
