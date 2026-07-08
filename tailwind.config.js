/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  // ⚠️ IMPORTANT — see "Tailwind gotcha" note below
  safelist: [
    { pattern: /(bg|text|border)-(blue|green|red|purple|yellow|orange|pink|indigo|teal|gray|cyan|amber)-(100|200|500|700|800)/ },
  ],
  theme: { extend: {} },
  plugins: [],
}
