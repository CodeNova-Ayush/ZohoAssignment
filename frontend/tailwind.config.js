/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        yc: {
          orange: '#ff6600',
          dark: '#111215',
          panel: '#18191e',
          border: '#272930',
        },
        canvas: {
          light: '#f5f6f8',
          dark: '#0d0e12',
        },
        surface: {
          light: '#ffffff',
          dark: '#16171d',
          alt: '#1b1d24',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        yc: '0 8px 30px rgba(0, 0, 0, 0.12)',
        glow: '0 0 20px -3px rgba(255, 102, 0, 0.25)',
      },
    },
  },
  plugins: [],
};
