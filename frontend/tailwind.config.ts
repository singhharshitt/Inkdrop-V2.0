import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        open: ['"Open Sans"', 'sans-serif'],
        bitter: ['"Bitter"', 'serif'],
        nunito: ['"Nunito"', 'sans-serif'],
        libertinus: ['"Libertinus Mono"', 'monospace'],
        wink: ['"Winky Rough"', 'cursive'], // 👈 fix quotes
      },
    },
  },
  plugins: [],
}

export default config
