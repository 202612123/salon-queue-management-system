import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cherry: {
          DEFAULT: '#702D3D', // Deep Cherry Burgundy
          hover: '#5B2431',
          light: '#8B384B',
          dark: '#481D27',
          muted: '#8C4355',
        },
        blush: {
          DEFAULT: '#E8C7CC', // Blush Pink
          light: '#FAF1F3',
          surface: '#FDF7F8',
          card: '#F9ECEE',
          border: '#DCB5BB',
          hover: '#F2DDE1',
        },
        cream: {
          DEFAULT: '#FFF8F2', // Warm Cream (Canvas)
          surface: '#FFFFFF', // Clean White Cards
          card: '#FCF5EF',
          muted: '#F5ECE3',
          border: '#EEDFD5',
        },
        rose: {
          DEFAULT: '#B77A85', // Dusty Rose
          light: '#CF99A3',
          dark: '#9A5F6A',
        },
        darkText: {
          DEFAULT: '#38252B', // Dark Text
          muted: '#684E55',
          subtle: '#8C7077',
        },
        status: {
          waiting: '#D97706',  // Amber
          called: '#702D3D',   // Deep Cherry (Grace Active)
          serving: '#15803D',  // Emerald Green
          done: '#702D3D',     // Cherry Burgundy
          cancelled: '#BE123C',// Crimson Rose
          noshow: '#8C7077',   // Muted Slate Rose
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
        gujarati: ['Noto Sans Gujarati', 'sans-serif'],
      },
      boxShadow: {
        'cherry-sm': '0 2px 8px -1px rgba(112, 45, 61, 0.08)',
        'cherry': '0 4px 20px -2px rgba(112, 45, 61, 0.12)',
        'cherry-lg': '0 10px 30px -4px rgba(112, 45, 61, 0.18)',
      }
    },
  },
  plugins: [],
};
export default config;
