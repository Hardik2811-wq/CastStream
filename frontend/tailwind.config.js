/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'surface-container-lowest': '#040711',
        'surface-container-low': '#0a0f1d',
        'surface-container': '#0f172a',
        'surface-container-high': '#1e293b',
        'surface-container-highest': '#334155',
        surface: '#070b16',
        primary: '#E50914', // Netflix signature red
        'primary-container': '#ff1e2b',
        'on-primary': '#ffffff',
        'on-primary-container': '#ffffff',
        secondary: '#8b5cf6', // Electric Violet
        'secondary-container': '#6d28d9',
        'on-secondary': '#ffffff',
        accent: '#06b6d4', // Cyan neon
        void: '#02040a',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        '2xl': '0.75rem',
        '3xl': '1rem',
        full: '9999px',
      },
      boxShadow: {
        'bezel-outer': '0 0 0 1px rgba(255, 255, 255, 0.08), 0 20px 50px rgba(0, 0, 0, 0.7)',
        'bezel-inner': 'inset 0 1px 1px rgba(255, 255, 255, 0.12)',
        'crimson-glow': '0 0 35px rgba(229, 9, 20, 0.45)',
        'violet-glow': '0 0 35px rgba(139, 92, 246, 0.4)',
      },
    },
  },
  plugins: [],
};
