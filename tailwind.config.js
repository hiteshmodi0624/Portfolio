/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    screens: { sm: '640px', md: '768px', lg: '1100px', xl: '1280px' },
    extend: {
      colors: {
        bg: '#0c0b09',
        'bg-2': '#131210',
        'text-1': '#f0e8d8',
        'text-2': '#8a7a62',
        'text-3': '#5c4f3a',
        gold: '#c9a84c',
        beige: '#e8d5b5',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #c9a84c, #e8d5b5)',
        'gradient-alt': 'linear-gradient(135deg, #e8d5b5, #c9a84c)',
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '24px',
      },
      animation: {
        'blob-1': 'blob1 12s ease-in-out infinite',
        'blob-2': 'blob2 16s ease-in-out infinite',
        'blob-3': 'blob3 20s ease-in-out infinite',
        'marquee': 'marquee 28s linear infinite',
        'marquee-2': 'marquee2 28s linear infinite',
      },
      keyframes: {
        blob1: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '33%': { transform: 'translate(40px,-30px) scale(1.08)' },
          '66%': { transform: 'translate(-25px,20px) scale(0.94)' },
        },
        blob2: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '40%': { transform: 'translate(-50px,30px) scale(1.1)' },
          '70%': { transform: 'translate(30px,-40px) scale(0.92)' },
        },
        blob3: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '50%': { transform: 'translate(20px,50px) scale(1.06)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        marquee2: {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
      },
    },
  },
  plugins: [],
};
