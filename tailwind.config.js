const { hairlineWidth } = require('nativewind/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // ── Brand / screen-level palette ──────────────────
        hero: '#C9D8C5',
        'starter-card': '#FFE0FE',
        brand: '#DDF700',
        'deck-1': '#F4E7D3',
        'deck-2': '#D7E2F2',
        'deck-3': '#FFE3F3',
        'deck-4': '#EADFF6',
        'create-bg': '#E6D6E9',
        'rating-again': '#FFE7E7',
        'rating-hard': '#FFF8E7',
        'rating-good': '#E9FFE5',
        'rating-easy': '#E7F2FF',
        'error-bg': '#E29191',
        // ── Design-system tokens ──────────────────────────
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        // ── Andada Pro — used for large serif headlines ────
        andada: ['AndadaPro_400Regular'],
        'andada-medium': ['AndadaPro_500Medium'],
        'andada-semibold': ['AndadaPro_600SemiBold'],
        'andada-bold': ['AndadaPro_700Bold'],
        // ── Instrument Sans — used for body text / labels ──
        'instrument-sans': ['InstrumentSans_400Regular'],
        'instrument-sans-medium': ['InstrumentSans_500Medium'],
        'instrument-sans-semibold': ['InstrumentSans_600SemiBold'],
        'instrument-sans-bold': ['InstrumentSans_700Bold'],
        // ── Amiri — used for Arabic script text ────────────
        amiri: ['Amiri_400Regular'],
        'amiri-bold': ['Amiri_700Bold'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [require('tailwindcss-animate')],
};
