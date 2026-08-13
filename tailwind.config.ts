/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        'navy-dark': 'var(--navy-dark)',
        'navy-mid': 'var(--navy-mid)',
        'navy-light': 'var(--navy-light)',
        'emerald-dark': 'var(--emerald-dark)',
        'emerald-mid': 'var(--emerald-mid)',
        'emerald-light': 'var(--emerald-light)',
        'emerald-pale': 'var(--emerald-pale)',
        'red-accent': 'var(--red-accent)',
        'red-light': 'var(--red-light)',
        'surface-container': 'var(--surface-container)',
        'surface-container-high': 'var(--surface-container-high)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm: 'calc(var(--radius) * 0.5)',
        md: 'var(--radius)',
        lg: 'calc(var(--radius) * 1.5)',
        xl: 'calc(var(--radius) * 2)',
        '2xl': 'calc(var(--radius) * 2.5)',
        '3xl': 'calc(var(--radius) * 3)',
        '4xl': 'calc(var(--radius) * 4)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'emerald-sm': '0 4px 16px rgba(5, 150, 105, 0.15)',
        'emerald-md': '0 8px 32px rgba(5, 150, 105, 0.2)',
        'emerald-lg': '0 16px 48px rgba(5, 150, 105, 0.25)',
        'navy-sm': '0 4px 16px rgba(15, 23, 42, 0.12)',
        'navy-md': '0 8px 32px rgba(15, 23, 42, 0.18)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};