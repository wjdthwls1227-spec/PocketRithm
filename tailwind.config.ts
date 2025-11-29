import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#FFFFFF',
        surface: '#F7F7F8',
        border: '#E6E6E7',
        textPrimary: '#111111',
        textSecondary: '#565656',
        textTertiary: '#8E8E93',
        accent: '#2864FF',
        typeDesire: '#FF6B6B',
        typeLack: '#FFD43B',
        typeNeed: '#4C6EF5',
      },
      fontFamily: {
        sans: ['Pretendard', 'Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        'top': '32px',
        'section': '40px',
        'block': '28px',
      },
      boxShadow: {
        'subtle': '0 2px 4px rgba(0, 0, 0, 0.04)',
      },
      colors: {
        bg: '#FFFFFF',
        surface: '#F7F7F8',
        border: '#E6E6E7',
        textPrimary: '#111111',
        textSecondary: '#565656',
        textTertiary: '#8E8E93',
        accent: '#2864FF',
        typeDesire: '#FF6B6B',
        typeLack: '#FFD43B',
        typeNeed: '#4C6EF5',
      },
      borderRadius: {
        'button': '12px',
        'input': '12px',
        'chip': '16px',
      },
    },
  },
  plugins: [],
}
export default config

