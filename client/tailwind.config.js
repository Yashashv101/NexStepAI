/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        bg900: 'var(--bg-900)',
        bg800: 'var(--bg-800)',
        surface: 'var(--surface)',
        textPrimary: 'var(--text-primary)',
        muted: 'var(--muted)',
        accentGreen: 'var(--accent-green)',
        accentGreen600: 'var(--accent-green-600)',
      },
      fontSize: {
        'xs': '0.75rem',    // 12px
        'sm': '0.875rem',   // 14px
        'base': '1rem',     // 16px
        'lg': '1.125rem',   // 18px
        'xl': '1.25rem',    // 20px
        '2xl': '2rem',      // 32px
        '3xl': '2.5rem',    // 40px
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      lineHeight: {
        tight: '1.3',
        normal: '1.6',
        relaxed: '1.7',
      },
      letterSpacing: {
        tight: '-0.02em',
        normal: '0',
      },
    },
  },
  plugins: [],
}