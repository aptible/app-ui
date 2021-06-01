const lighten = {
  '100': 'rgba(255, 255, 255, 0.04)',
  '200': 'rgba(255, 255, 255, 0.08)',
  '300': 'rgba(255, 255, 255, 0.12)',
};

const gray = {
  '100': '#f9fbfc',
  '200': '#f4f7f9',
  '300': '#edf3f7',
  '400': '#dee7ee',
  '500': '#b9c8d2',
  '600': '#86a3b5',
  '700': '#47687d',
  '800': '#204156',
  '900': '#001b28',
};

const brandGreen = {
  '200': '#7de5ca',
  '300': '#5cd8b7',
  '400': '#33c69f',
  '500': '#20b08a',
  '600': '#12926f',
};

const blue = {
  '0': '#e6f3ff',
  '100': '#c2e2ff',
  '200': '#76baf9',
  '300': '#3e9ef5',
  '400': '#0d7de4',
  '500': '#0668ca',
  '600': '#0052b1',
};

const green = {
  '100': '#e8f5ee',
  '200': '#a1ddae',
  '300': '#7bc88c',
  '400': '#54af68',
  '500': '#3c9f52',
  '600': '#29853d',
};

const gold = {
  '100': '#fff4de',
  '200': '#ffd883',
  '300': '#ffcc5a',
  '400': '#fdb515',
  '500': '#f0a600',
  '600': '#dc9801',
};

const red = {
  '100': '#fdeeee',
  '200': '#ffa7a1',
  '300': '#fa7d76',
  '400': '#f25d54',
  '500': '#e4473e',
  '600': '#d93329',
};

const orange = {
  '200': '#ffc3a1',
  '300': '#ffaa7a',
  '400': '#f38f56',
  '500': '#ed7b3b',
  '600': '#e36823',
};

const pink = {
  '200': '#daccd7',
  '300': '#d3b8cd',
  '400': '#cca8c4',
  '500': '#c297b9',
  '600': '#b881ac',
};

const cyan = {
  '200': '#a1d8f1',
  '300': '#7dc3e4',
  '400': '#61accf',
  '500': '#3e9ecb',
  '600': '#2488b6',
};

const purple = {
  '200': '#c8b3e8',
  '300': '#a68ad2',
  '400': '#8969bd',
  '500': '#7757ad',
  '600': '#604194',
};

const functionalColors = {
  success: green['400'],
  failure: red['400'],
  caution: gold['400'],
  border: gray['400'],
  placeholder: gray['600'],
  link: blue['400'],
};

const colors = {
  transparent: 'transparent',
  white: '#fff',
  black: '#000b11',
  screen: 'rgba(0, 0, 0, 0.25)',
  lighten,
  gray,
  brandGreen,
  blue,
  green,
  gold,
  red,
  orange,
  pink,
  cyan,
  purple,
  ...functionalColors,
};

module.exports = {
  colors,
  borderColors: {
    DEFAULT: gray['400'],
    ...colors,
  },
};
