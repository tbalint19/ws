/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      gridTemplateColumns: {
        '4cols': 'repeat(4, 1fr)',
        '3cols': 'repeat(3, 1fr)',
        '2cols': 'repeat(2, 1fr)',
      }
    }
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["retro"],
  },
  safelist: [
    'btn-success',
    'btn-error',
  ]
}

