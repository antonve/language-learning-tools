module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './app/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {
      ringWidth: ['hover'],
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@headlessui/react')],
}
