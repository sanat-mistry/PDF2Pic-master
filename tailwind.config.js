/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
    colors: {
      'primary': '#176ede',
      'bg-primary': '#fff',
      'bg-secondary': '#edf2f8',
      'bg-terinary': '#fafafa',
      'body-bg': '#f5f8ff',
      'box-bg': '#fff',
      'input-bg': '#f5f8ff',
      'txt-color': '#2f2d2f',
      'txt-second-color': '#ccc',
      'border-color': '#4267b2'
    },
    },
  },
  plugins: [],
}

