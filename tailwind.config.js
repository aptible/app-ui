module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      black: '#000000',
      white: '#FFFFFF',
      midnight: '#0A1B2B',
      purple: '#4b5563',
      grey: {
        100: '#FAFAFA',
        200: '#E5E5E5',
      },
      red: {
        100: '#D48D81',
        200: '#D67666',
      },
      green: {
        100: '#33C69F',
        200: '#088765',
      }
    },
    extend: {
      spacing: {
        '128': '32rem',
      }
    },
  },
  plugins: [],
}
