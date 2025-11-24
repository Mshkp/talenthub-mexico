/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'talenthub-blue': '#2563EB',
        'talenthub-gray': '#374151',
      }
    },
  },
  plugins: [],
}