/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
        display: ['var(--font-lexend)'],
      },
      colors: {
        'luxury-black': '#0a0a0a',
        'luxury-dark': '#121212',
        'luxury-silver': '#d9d9d9',
        'luxury-accent': '#00c2ff',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.luxury-silver'),
            a: {
              color: theme('colors.luxury-accent'),
              '&:hover': {
                color: theme('colors.luxury-accent'),
                opacity: 0.8,
              },
            },
            h1: {
              color: theme('colors.white'),
            },
            h2: {
              color: theme('colors.white'),
            },
            h3: {
              color: theme('colors.white'),
            },
            h4: {
              color: theme('colors.white'),
            },
            code: {
              color: theme('colors.luxury-silver'),
              backgroundColor: theme('colors.luxury-dark'),
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            pre: {
              backgroundColor: theme('colors.luxury-dark'),
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};