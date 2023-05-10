export const tokens = {
  layout: {
    "main width": "max-w-7xl mx-auto px-4 sm:px-6 md:px-8 w-full",
  },

  type: {
    h1: "text-gray-900 text-3xl font-semibold",
    h2: "text-xl font-semibold text-gray-900",
    h3: "text-lg font-semibold text-gray-900",
    h4: "text-md font-semibold text-gray-900",

    link: "font-medium text-sm text-gray-500 hover:text-gray-700",

    "active link": "font-medium text-sm text-gray-700",
    "subdued active link": "font-medium text-sm text-amber-600",

    "small semibold darker": "text-sm font-semibold text-gray-900",
    "small normal darker": "text-sm font-normal text-gray-900",
    "small normal lighter": "text-sm font-normal text-gray-500",
    "medium label": "font-medium text-gray-900",
    darker: "text-gray-900",
    "normal lighter": "text-gray-500",
    "normal blue lighter": "text-blue-500",
    "small lighter": "text-sm text-gray-500",
    textarea:
      "appearance-none block px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm w-full h-32 disabled:bg-black-50 disabled:cursor-not-allowed",
    pre: "p-4 bg-black rounded text-white",
  },

  buttons: {
    sizes: {
      xs: "px-2.5 py-1.5 text-xs font-medium ",
      sm: "px-3 py-2 text-sm leading-4 font-medium",
      md: "px-4 py-2 text-base font-medium",
      lg: "px-4 py-2 text-base font-medium",
      xl: "px-6 py-3 text-base font-medium",
    },
    styles: {
      primary:
        "border border-transparent shadow-sm font-bold text-black bg-gradient-to-r from-yellow-400 to-yellow-500 hover:no-underline hover:from-yellow hover:to-yellow focus:from-orange-400 focus:to-orange-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:from-orange-200 disabled:to-orange-200 disabled:text-black-300 disabled:cursor-not-allowed",
      secondary:
        "border border-transparent font-bold text-white bg-indigo hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600",
      white:
        "border border-black-100 font-bold shadow-sm text-black bg-white hover:bg-black-100 hover:border-black-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black-200",
      delete:
        "border border-red-100 font-bold shadow-sm text-white bg-red hover:bg-red-100 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-200",
      success:
        "border border-transparent font-bold bg-green-400 text-white hover:bg-green-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600",
    },
  },
};
