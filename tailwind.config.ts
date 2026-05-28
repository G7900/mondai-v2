import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // MondAI Design System
        bg: {
          base: '#080B10',
          deep: '#050710',
          card: '#0E1219',
          elevated: '#141820',
          border: '#1E2530',
        },
        accent: {
          green: '#00E5A0',
          'green-dim': '#00B87D',
          blue: '#3B82F6',
          'blue-bright': '#60A5FA',
          purple: '#8B5CF6',
          'purple-soft': '#A78BFA',
        },
        text: {
          primary: '#F0F4FF',
          secondary: '#8892A4',
          muted: '#4A5568',
          inverse: '#080B10',
        },
        status: {
          success: '#00E5A0',
          error: '#FF4D6D',
          warning: '#FFB547',
          info: '#3B82F6',
        }
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui'],
        body: ['var(--font-body)', 'system-ui'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'radial-gradient(at 40% 20%, hsla(160,100%,45%,0.08) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(220,100%,60%,0.06) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(270,100%,60%,0.05) 0px, transparent 50%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)',
        'green-glow': 'radial-gradient(ellipse at center, rgba(0,229,160,0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'card': '0 1px 0 rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 1px 0 rgba(255,255,255,0.06), 0 8px 40px rgba(0,0,0,0.5)',
        'green-glow': '0 0 20px rgba(0,229,160,0.25), 0 0 60px rgba(0,229,160,0.08)',
        'blue-glow': '0 0 20px rgba(59,130,246,0.3)',
        'inner-border': 'inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-green': 'pulseGreen 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'count-up': 'countUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGreen: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(0,229,160,0.4)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 0 8px rgba(0,229,160,0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        countUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}

export default config
