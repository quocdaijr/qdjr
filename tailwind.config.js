const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  // mode: 'jit',
  darkMode: 'class',
  purge: [],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', ...defaultTheme.fontFamily.sans],
      },
      animation: {
        fade: 'fadeOut 5s ease-in-out',
      },

      // that is actual animation
      keyframes: theme => ({
        fadeOut: {
          '0%': { backgroundColor: theme('colors.red.300') },
          '100%': { backgroundColor: theme('colors.transparent') },
        },
      }),
    },
  },
  variants: {
    extend: {
      opacity: ['dark'],
    },
  },
  plugins: [],
};
