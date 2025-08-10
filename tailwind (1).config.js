/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
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
        },
      },
      boxShadow: {
        'terminal-green': '0 0 6px 0 rgba(0, 255, 65, 0.5)',
      },
      fontFamily: {
        ocr: ['var(--font-ocr)'],
        ibm: ['var(--font-ibm)'],
      },
      animation: {
        blink: 'blink 1s step-end infinite',
        glitch: 'glitch 0.3s linear infinite',
        fadeIn: 'fadeIn 0.3s ease-in-out',
        slideIn: 'slideIn 0.3s ease-out',
        typewriter: 'typewriter 2s steps(40, end)',
      },
      animationDelay: {
        '300': '300ms',
        '600': '600ms',
        '900': '900ms',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        glitch: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-2px)' },
          '40%': { transform: 'translateX(2px)' },
          '60%': { transform: 'skewX(2deg)' },
          '80%': { transform: 'skewX(-2deg)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        typewriter: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
