/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0F0F14',
          secondary: '#12121A',
          tertiary: '#1A1A24',
        },
        accent: {
          cyan: '#00F5FF',
          blue: '#0080FF',
          violet: '#8B5CF6',
          amber: '#FFB800',
          green: '#00FF88',
        },
      },
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backdropBlur: {
        glass: '20px',
      },
      borderRadius: {
        card: '16px',
      },
      boxShadow: {
        'glow-cyan': '0 0 24px rgba(0, 245, 255, 0.25)',
        'glow-blue': '0 0 24px rgba(0, 128, 255, 0.25)',
        'glow-violet': '0 0 24px rgba(139, 92, 246, 0.25)',
        'glow-amber': '0 0 24px rgba(255, 184, 0, 0.25)',
        'glow-green': '0 0 24px rgba(0, 255, 136, 0.25)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        fast: '200ms',
        normal: '300ms',
        slow: '350ms',
      },
    },
  },
  plugins: [],
}
