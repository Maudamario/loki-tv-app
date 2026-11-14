/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        loki: {
          black: '#050607',
          dark: '#0a0c0f',
          card: '#111417',
          cardhover: '#181c21',
          border: '#1f2530',
          green: '#00FF66',
          'green-dim': '#10B981',
          'green-dark': '#0a8a48',
          white: '#FFFFFF',
          gray: '#8b949e',
          'gray-dim': '#5c6470',
          danger: '#ef4444',
          'danger-dark:': '#991b1b',
          warning: '#f59e0b',
          'warning-dark': '#92400e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'loki-glow': '0 0 20px rgba(0, 255, 102, 0.45)',
        'loki-glow-lg': '0 0 40px rgba(0, 255, 102, 0.55)',
        'loki-danger': '0 0 30px rgba(239, 68, 68, 0.5)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 255, 102, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 255, 102, 0.7)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
