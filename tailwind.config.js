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
        ocr: ['OCRA', 'monospace'],
        ibm: ['IBM 3270', 'monospace'],
      },
      fontWeight: {
        'ocr': '500',
        'ibm': '400',
      },
      boxShadow: {
        'terminal-green': '0 0 6px 0 rgba(0, 255, 65, 0.5)',
        'terminal-text-glow': '0 0 2px rgba(0, 255, 65, 0.5)',
        'terminal-strong-glow': '0 0 5px rgba(0, 255, 65, 0.8), 0 0 10px rgba(0, 255, 65, 0.4)',
        'terminal-inner-glow': 'inset 0 0 80px rgba(0, 255, 65, 0.08)',
        'crt-glow': '0 0 30px rgba(0, 255, 65, 0.15)',
        'theme-glitch-shadow': '0 0 5px rgba(255, 0, 255, 0.8), 0 0 10px rgba(255, 0, 255, 0.4)',
      },
      animation: {
        blink: 'blink 1s step-end infinite',
        glitch: 'glitch 0.3s linear infinite',
        fadeIn: 'fadeIn 0.3s ease-in-out',
        slideIn: 'slideIn 0.3s ease-out',
        typewriter: 'typewriter 2s steps(40, end)',
        textGlitch: 'textGlitch 0.3s linear infinite',
        fadeOut: 'fadeOut 0.3s ease-in-out',
        scanlines: 'scanlines 2s linear infinite',
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
        textGlitch: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '20%': { transform: 'translate3d(-1px, 0, 0)' },
          '40%': { transform: 'translate3d(1px, 0, 0)' },
          '60%': { transform: 'translate3d(-1px, 0, 0)' },
          '80%': { transform: 'translate3d(1px, 0, 0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        typewriter: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
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
