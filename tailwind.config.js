/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        parchment: '#e8dfd0',
        'parchment-dark': '#ded2bd',
        gold: '#d4af6a',
        'gold-light': '#e8cf98',
        sienna: '#7a3d24',
        ink: '#2b2622',
        'sky-panel': '#ccd2d8',
      },
      fontFamily: {
        fraunces: ["'Fraunces Variable'", 'Georgia', 'serif'],
        newsreader: ["'Newsreader Variable'", 'Georgia', 'serif'],
        mono: ["'JetBrains Mono'", 'monospace'],
      },
      backgroundImage: {
        'sky-gradient': 'linear-gradient(175deg, #cdd6de 0%, #c9d3dc 30%, #a8b6c4 68%, #8fa0b3 100%)',
      },
    },
  },
  plugins: [],
}
