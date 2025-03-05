module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx}',
      './src/**/*.{js,ts,jsx,tsx}', // Add src folder for your components
    ],
    theme: {
      extend: {},
    },
    plugins: [
      require('@tailwindcss/forms'),
      require('@tailwindcss/typography'),
    ],
  }
  