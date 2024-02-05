module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
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
