/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      colors: {
        background: '#050505',
        surface: '#0a0a0a',
        glass: 'rgba(255, 255, 255, 0.03)',
        'glass-hover': 'rgba(255, 255, 255, 0.08)',
        'glass-active': 'rgba(255, 255, 255, 0.12)',
        border: 'rgba(255, 255, 255, 0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
        'slide-in-right': 'slideInRight 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
        'pop-in': 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'bg-shift': 'bgShift 30s ease infinite alternate',
        'wave': 'wave 1.2s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite linear',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(20px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        slideInRight: { '0%': { opacity: 0, transform: 'translateX(20px)' }, '100%': { opacity: 1, transform: 'translateX(0)' } },
        popIn: { '0%': { opacity: 0, transform: 'scale(0.9) translateY(10px)' }, '100%': { opacity: 1, transform: 'scale(1) translateY(0)' } },
        bgShift: { '0%': { backgroundPosition: '0% 50%' }, '100%': { backgroundPosition: '100% 50%' } },
        wave: { '0%, 100%': { height: '20%', opacity: 0.5 }, '50%': { height: '100%', opacity: 1 } },
        pulseGlow: { '0%, 100%': { boxShadow: '0 0 10px rgba(99, 102, 241, 0.2)' }, '50%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)' } },
        shimmer: { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(100%)' } }
      },
    },
  },
  plugins: [],
}