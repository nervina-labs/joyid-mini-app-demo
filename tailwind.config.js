/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,ts, tsx}"],
  theme: {
    fontSize: {
      xs: ['12px', '16px'],
      sm: ['14px', '20px'],
      base: ['16px', '24px'],
      lg: ['20px', '28px'],
      xl: ['24px', '32px'],
    },
    extend: {},
  },
  plugins: [require("daisyui")],
};

