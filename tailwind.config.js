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
        accent: {
          DEFAULT: "#F76511",
          hover: "#E05E12", 
          active: "#C24E0D",
          soft: "#FEE7DA",
        },
        'accent-foreground': 'var(--accent-foreground)',
        destructive: 'var(--destructive)',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        ink: "#0F172A",
        success: { DEFAULT: "#16A34A", soft: "#DCFCE7" },
        danger: { DEFAULT: "#DC2626", soft: "#FEE2E2" },
        // Enhanced brand token system for better readability
        brand: {
          ink: '#0F172A',
          inkMuted: '#334155',
          panel: '#1F2937',
          panelSoft: '#111827',
          onPanel: '#F1F5F9',
          orange: '#D05A27',
          orangeBright: '#F76511',
          bg: 'var(--brand-bg)',
          card: 'var(--brand-card)',
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
        heading: ["Barlow Semi Condensed", "Inter", "system-ui", "sans-serif"],
        body: ['var(--font-inter)', 'sans-serif'],
      },
      borderRadius: {
        xl: "14px",
        "2xl": "18px",
        brand: 'var(--brand-radius)',
      },
      boxShadow: {
        card: '0 6px 18px rgba(15,23,42,0.12)',
        ring: "0 0 0 3px rgba(247,101,17,.25)",
        brand: 'var(--brand-shadow)',
      },
      maxWidth: {
        prose: '65ch'
      },
      fontSize: {
        base: ['1rem', { lineHeight: '1.7' }],
        lg: ['1.125rem', { lineHeight: '1.7' }],
        display: ['clamp(1.75rem,3.2vw,2.5rem)', { lineHeight: '1.2', letterSpacing: '-0.01em' }]
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