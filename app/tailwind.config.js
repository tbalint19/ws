/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      gridTemplateColumns: {
        '3cols': 'repeat(3, 1fr)',
      }
    }
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["retro"],
  },
}

