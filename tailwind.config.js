/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Mapping our primary brand color
        brand: {
          500: '#22c55e', // green-500
          600: '#16a34a', // green-600
        }
      }
    },
  },
  plugins: [],
}