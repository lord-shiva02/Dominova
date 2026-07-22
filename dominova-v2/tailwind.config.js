/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#FFFFFF',
        'bg-secondary': '#FAF8F3',
        'bg-dark-accent': '#0B0E1A',
        'gold-primary': '#C9A227',
        'gold-light': '#E5C158',
        'gold-deep': '#9C7A1A',
        'text-primary': '#12141C',
        'text-secondary': '#5B5E6B',
        'text-on-dark': '#F5F5F0',
        'border-hairline': 'rgba(201,162,39,0.25)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
