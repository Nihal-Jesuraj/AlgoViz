/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#F7F5F0',
          warm: '#F0EDE6',
          cream: '#FAF9F6',
          card: 'rgba(255, 255, 255, 0.70)',
          'card-hover': 'rgba(255, 255, 255, 0.85)',
        },
        accent: {
          purple: {
            DEFAULT: '#7C3AED',
            light: '#9B8AFB',
            lighter: '#EDE9FE',
            dark: '#5B21B6',
            glow: 'rgba(124, 58, 237, 0.15)',
          },
          teal: {
            DEFAULT: '#06D6A0',
            light: '#4DD4C6',
            lighter: '#CCFBF1',
            dark: '#0D9488',
          },
          cyan: {
            DEFAULT: '#06B6D4',
            light: '#67E8F9',
          },
        },
        node: {
          default: 'rgba(255, 255, 255, 0.9)',
          queued: '#F59E0B',
          current: '#7C3AED',
          visited: '#06D6A0',
          'in-path': '#10B981',
          'in-mst': '#0D9488',
        },
        glass: {
          fill: 'rgba(255, 255, 255, 0.70)',
          border: 'rgba(0, 0, 0, 0.06)',
          'border-hover': 'rgba(0, 0, 0, 0.10)',
        },
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'DM Sans', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', '"Cascadia Code"', 'monospace'],
      },
      borderRadius: {
        'glass': '16px',
        'glass-lg': '20px',
        'glass-xl': '24px',
      },
      boxShadow: {
        'glass': '0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'glass-hover': '0 8px 32px rgba(0, 0, 0, 0.10), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'glass-elevated': '0 12px 40px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)',
        'purple-glow': '0 0 24px rgba(124, 58, 237, 0.20), 0 0 8px rgba(124, 58, 237, 0.10)',
        'teal-glow': '0 0 24px rgba(6, 214, 160, 0.20), 0 0 8px rgba(6, 214, 160, 0.10)',
        'node': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'node-active': '0 0 16px rgba(124, 58, 237, 0.40), 0 2px 8px rgba(0, 0, 0, 0.10)',
      },
      animation: {
        'float': 'float 20s ease-in-out infinite',
        'float-slow': 'float 30s ease-in-out infinite',
        'float-fast': 'float 12s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -20px) scale(1.05)' },
          '66%': { transform: 'translate(-20px, 15px) scale(0.95)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 16px rgba(124, 58, 237, 0.30)' },
          '50%': { boxShadow: '0 0 28px rgba(124, 58, 237, 0.50)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      backdropBlur: {
        'glass': '16px',
        'glass-heavy': '24px',
      },
    },
  },
  plugins: [],
}
