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
        navy: {
          DEFAULT: '#0D1B2A',
          2: '#0a1422',
          3: '#07101c',
        },
        cyan: {
          DEFAULT: '#00C2CB',
          2: '#00dcff',
          d: '#008b91',
        },
        blink: {
          bg: '#0D1B2A',
          accent: '#00C2CB',
          text: '#FFFFFF',
          secondary: '#E8EDF2',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        grotesk: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
        serif: ['Instrument Serif', 'serif'],
      },
      animation: {
        'pulse-slow': 'pulse 2.4s ease-in-out infinite',
        'count-up': 'count-up 1.5s ease-out forwards',
      },
      backgroundImage: {
        'hex-pattern': "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 86.6'><path d='M50 0 L100 28.87 L100 86.6 L50 115.47 L0 86.6 L0 28.87 Z M50 5.77 L5 31.74 L5 83.73 L50 109.7 L95 83.73 L95 31.74 Z' fill='none' stroke='%2300C2CB' stroke-width='0.4' opacity='0.18'/></svg>\")",
      },
    },
  },
  plugins: [],
}

export default config
