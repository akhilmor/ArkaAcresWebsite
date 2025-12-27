import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C0552F', // burnt orange
          light: '#D67A5A',
          dark: '#A04425',
        },
        sage: {
          DEFAULT: '#9CAF88',
          light: '#B8C9A8',
          dark: '#7A8F6A',
        },
        earth: {
          DEFAULT: '#8B7355',
          light: '#A68F75',
          dark: '#6D5A42',
        },
        neutral: {
          50: '#FAF9F6',
          100: '#F5F1E8',
          200: '#E8E2D5',
          300: '#D4CCC0',
          400: '#B8AFA0',
          500: '#9A8F7E',
          600: '#7A6F5E',
          700: '#5C5244',
          800: '#3E362C',
          900: '#2C241C',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config

