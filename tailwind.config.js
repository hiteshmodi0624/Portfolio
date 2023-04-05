/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
 
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'sm':'640px',
      'md':'768px',
      'lg':'1100px',
      'xl':'1280px'
    },
    extend: {
      colors:{
        primary1:"#9A9A9A",
        primary2:"#D4D4D4",
        secondary1:"#0A101D",
        secondary2:"#0F1623",
        tertiary1:"#78CC6C",
        tertiary2:"#196375"
      },
    },
  },
}
