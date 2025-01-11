/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      width: {
        '15': '3.75rem',
      },
      height: {
        '15': '3.75rem',
      },
    },
  },
  plugins: [],
};
