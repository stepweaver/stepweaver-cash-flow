/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          DEFAULT: '#0d1211',
          dark: '#0d1211',
          light: '#131918',
          border: '#2a302d',
          green: '#00ff41',
          yellow: '#ffff00',
          red: '#ff3e3e',
          blue: '#38beff',
          text: '#e2e2e2',
          muted: '#8b949e',
          cyan: '#56b6c2',
          dimmed: '#6a737d',
          window: '#0d1211',
          header: '#131918',
          magenta: '#ff55ff',
          pink: '#ff55ff',
          purple: '#a855f7',
          orange: '#ffa500',
          white: '#ffffff',
          black: '#000000',
        },
        background: '#0d1211',
        foreground: '#00ff00',
      },
      fontFamily: {
        ibm: ['IBM 3270', 'monospace'],
      },
      fontWeight: {
        'ibm': '400',
      },
      boxShadow: {
        'terminal-green': '0 0 6px 0 rgba(0, 255, 65, 0.5)',
      },
      animation: {
        scanlines: 'scanlines 2s linear infinite',
      },
      keyframes: {
        scanlines: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.1' },
        },
      },
      backgroundImage: {
        'scanlines': 'linear-gradient(transparent 50%, rgba(0, 255, 65, 0.03) 50%)',
      },
      backgroundSize: {
        'scanlines': '100% 4px',
      },
    },
  },
  plugins: [],
};
