const defaultTheme = require("tailwindcss/defaultTheme");
const flex = defaultTheme.flex;

/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ["./src/**/*.{ts,tsx}", "./index.html"],
  darkMode: "class",
  theme: {
    extend: {
      borderWidth: {
        DEFAULT: '1px',
        '0': '0',
        '2': '2px',
        '3': '3px',
        '4': '4px',
        '6': '6px',
        '8': '8px',
      },
      fontSize: {
        sm: ["12px", "20px"],
        base: ["14px", "20px"],
        md: ["16px", "24px"],
        lg: ["20px", "28px"],
        xl: ["24px", "32px"],
      },
      
      fontFamily: {
        sans: [...defaultTheme.fontFamily.sans],
        serif: [...defaultTheme.fontFamily.serif],
        mono: [...defaultTheme.fontFamily.mono],
      },
      transitionProperty: {
        "bg-border": "background-color, border-color",
      },
      flex: {
        ...flex,
        "cell-sm": "0 0 220px",
        "cell-md": "0 0 300px",
        "cell-lg": "0 0 480px",
      },
      colors: {
        gold: "#E09600",
        brown: "#825804",
        plum: "#98256A",
        forest: "#00633F",

        "off-white": "#FDF8F0",
        white: "#FFFFFF",

        black: "#111920",
        "black-700": "#111920",
        "black-600": "#343B41",
        "black-500": "#595E63",
        "black-400": "#707579",
        "black-300": "#888C90",
        "black-200": "#B8BABD",
        "black-100": "#E7E8E8",
        "black-50": "#FAFAFA",

        yellow: "#FFB607",
        "yellow-400": "#FDDB1C",
        "yellow-500": "#FFB607",

        "orange-700": "#5A3C00",
        "orange-600": "#865A00",
        "orange-500": "#B37800",
        "orange-400": "#E09600",
        "orange-300": "#E9B64D",
        "orange-200": "#F3D599",
        "orange-100": "#FCF4E5",

        lavender: "#BA9FF4",
        "lavender-700": "#BA9FF4",
        "lavender-600": "#705F92",
        "lavender-500": "#957FC3",
        "lavender-400": "#BA9FF4",
        "lavender-300": "#CFBCF7",
        "lavender-200": "#E3D9FB",
        "lavender-100": "#F8F5FE",

        "maroon-700": "#3D0F2A",
        "maroon-600": "#5B1640",
        "maroon-500": "#7A1E55",
        "maroon-400": "#98256A",
        "maroon-300": "#B76797",
        "maroon-200": "#D6A8C3",
        "maroon-100": "#F5E9F0",

        red: "#AD1A1A",
        "red-700": "#530B0B",
        "red-600": "#741414",
        "red-500": "#901717",
        "red-400": "#AD1A1A",
        "red-300": "#C76464",
        "red-200": "#E3A3A3",
        "red-100": "#FDE3E3",

        lime: "#A4E352",
        "lime-700": "#425B21",
        "lime-600": "#628831",
        "lime-500": "#83B642",
        "lime-400": "#A4E352",
        "lime-300": "#BFEB86",
        "lime-200": "#DBF4BA",
        "lime-100": "#EDF9DC",

        "green-700": "#002819",
        "green-600": "#003B26",
        "green-500": "#004F32",
        "green-400": "#00633F",
        "green-300": "#4D9279",
        "green-200": "#99C1B2",
        "green-100": "#E5EFEB",

        cyan: "#68EFD6",
        "cyan-700": "#2A6056",
        "cyan-600": "#3E8F80",
        "cyan-500": "#53BFAB",
        "cyan-400": "#68EFD6",
        "cyan-300": "#96F4E2",
        "cyan-200": "#C3F9EF",
        "cyan-100": "#E8FDF9",

        indigo: "#4361FF",
        "indigo-700": "#1B2766",
        "indigo-600": "#283A99",
        "indigo-500": "#364ECC",
        "indigo-400": "#4361FF",
        "indigo-300": "#7C91FF",
        "indigo-200": "#B4C0FF",
        "indigo-100": "#ECEFFF",
      },
    },
  },
  variants: {
    extend: {
      padding: ["first", "last"],
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/line-clamp"),
  ],
};
