const colors = require('tailwindcss/colors');
const flex = require('tailwindcss/defaultTheme').flex;

module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './index.html'],
  darkMode: 'class',
  theme: {
    extend: {
      transitionProperty: {
        'bg-border': 'background-color, border-color',
      },
      flex: {
        ...flex,
        'cell-sm': '0 0 220px',
        'cell-md': '0 0 300px',
        'cell-lg': '0 0 480px',
      },
      colors: {
        ...colors,
        gray: colors.neutral,
      },
    },
  },
  variants: {
    extend: {
      padding: ['first', 'last'],
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/line-clamp'),
  ],
};
