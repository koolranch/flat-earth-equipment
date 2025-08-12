const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        popover: 'var(--popover)',
        'popover-foreground': 'var(--popover-foreground)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        secondary: 'var(--secondary)',
        'secondary-foreground': 'var(--secondary-foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        destructive: 'var(--destructive)',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        // Unified brand token system
        brand: {
          bg: 'var(--brand-bg)',
          card: 'var(--brand-card)',
          ink: 'var(--brand-ink)',
          muted: 'var(--brand-muted)',
          border: 'var(--brand-border)',
          accent: 'var(--brand-accent)',
          accentHover: 'var(--brand-accent-hover)',
          chip: 'var(--brand-chip)',
          // Legacy compatibility
          DEFAULT: '#D35400',      // rust-orange
          light: '#E59866',        // sand highlight
          dark: '#5D6D7E',         // slate-gray
        },
        'canyon-rust': '#C45A38',
        safety: '#F76511',
      },
      fontFamily: {
        sans: ['var(--font-inter)', ...defaultTheme.fontFamily.sans],
        heading: ['"Roboto Slab"', 'serif'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
      borderRadius: {
        xl: '1.25rem',
        brand: 'var(--brand-radius)',
      },
      boxShadow: {
        card: '0 4px 6px rgba(0,0,0,0.1)',
        brand: 'var(--brand-shadow)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 