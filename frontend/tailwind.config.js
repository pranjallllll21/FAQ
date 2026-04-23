export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        glow: '#a855f7',
        dark: {
          bg: '#0a0a0a',
          card: '#1a1a2e',
          border: '#2d2d44',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-border': 'glowBorder 3s ease-in-out infinite',
        'typing': 'typing 0.6s steps(2, end) infinite',
        'float': 'float 3s ease-in-out infinite',
        'scale-pulse': 'scalePulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(168, 85, 247, 0.7)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 30px 15px rgba(168, 85, 247, 0)' },
        },
        glowBorder: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(168, 85, 247, 0.3), inset 0 0 10px rgba(168, 85, 247, 0.1)' },
          '50%': { boxShadow: '0 0 30px rgba(168, 85, 247, 0.6), inset 0 0 20px rgba(168, 85, 247, 0.2)' },
        },
        typing: {
          'to': { width: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scalePulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
        },
      },
      backdropFilter: {
        'none': 'none',
        'blur': 'blur(20px)',
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(168, 85, 247, 0.4)',
        'glow': '0 0 30px rgba(168, 85, 247, 0.6)',
        'glow-lg': '0 0 60px rgba(168, 85, 247, 0.8)',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}
