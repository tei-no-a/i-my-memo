/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'theme-bg': '#fff9f5',       // Very pale warm pink/orange (Main Background)
        'theme-bg-soft': '#ffeedd',  // Slightly darker warmth (Sidebar/Cards)
        'theme-fg': '#5c3a3a',       // Dark reddish brown (Text)
        'theme-accent': '#ff8e8e',   // Pastel Red (Primary Actions/Highlights)
        'theme-secondary': '#ffcbb3', // Peach (Secondary Accents)
        'theme-muted': '#e6d0cd',    // Muted/Disabled
        'theme-border': '#f0dcd9',   // Borders
      },
      fontFamily: {
        sans: ['"M PLUS Rounded 1c"', 'ui-sans-serif', 'system-ui', 'sans-serif'], // Suggested font for cute feel
      }
    },
  },
  plugins: [],
}
