/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#f8fafc',
        'dark-navy': '#ffffff',
        'light-navy': '#f1f5f9',
        'lightest-navy': '#cbd5e1',
        slate: '#1e3a5f',
        'light-slate': '#2c4a6e',
        'lightest-slate': '#0a1628',
        accent: '#1d4ed8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
