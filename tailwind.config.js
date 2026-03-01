/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'theme-bg': 'rgb(var(--color-theme-bg) / <alpha-value>)',
        'theme-bg-soft': 'rgb(var(--color-theme-bg-soft) / <alpha-value>)',
        'theme-fg': 'rgb(var(--color-theme-fg) / <alpha-value>)',
        'theme-accent': 'rgb(var(--color-theme-accent) / <alpha-value>)',
        'theme-secondary': 'rgb(var(--color-theme-secondary) / <alpha-value>)',
        'theme-muted': 'rgb(var(--color-theme-muted) / <alpha-value>)',
        'theme-border': 'rgb(var(--color-theme-border) / <alpha-value>)',
        'theme-card': 'rgb(var(--color-theme-card) / <alpha-value>)',
        'theme-danger-hover': 'rgb(var(--color-theme-danger-hover) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['"MySymbolFont"', '"BIZ UDPGothic"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
