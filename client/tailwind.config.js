/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: '#173D32',
        sage: '#DCE8DF',
        paper: '#F8F7F2',
        charcoal: '#202923',
      },
    },
  },
  plugins: [],
}
