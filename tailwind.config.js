/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}", // <--- Make sure this line exists
    "./screens/**/*.{js,jsx,ts,tsx}",    // <--- ADD THIS LINE for your new screens folder!
    // Add any other paths where you might use Tailwind classes, e.g.,
    // "./src/**/*.{js,jsx,ts,tsx}",
  ],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {},
  },
  darkMode: 'class',
  plugins: [],
};
