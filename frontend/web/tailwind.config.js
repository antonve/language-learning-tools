module.exports = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx}', './src/app/**/*.{js,ts,jsx,tsx}'],
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
