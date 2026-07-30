import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FFD600',
        'primary-dark': '#B8960A',
        accent: '#FFD600',
        dark: '#0F1724',
        'dark-card': '#1A2332',
        'dark-lighter': '#1E293B',
        'dark-border': '#2D3A4A',
        'dark-muted': '#8896A8',
        secondary: '#A8B2C1',
      },
    },
  },
  plugins: [],
};

export default config;
