import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Clean White & Grey Theme
        paper: '#F8F9FA',      // Crisp light grey background
        surface: '#FFFFFF',    // Pure white cards & containers
        ink: {
          DEFAULT: '#0F172A',  // Deep slate / charcoal text
          muted: '#64748B',    // Subdued medium grey
          faint: '#94A3B8',    // Muted grey placeholder/subtext
        },
        forest: {
          DEFAULT: '#0F172A',  // Executive dark slate for primary buttons/accents
          dark: '#020617',
          light: '#1E293B',
          tint: '#F1F5F9',
        },
        olive: {
          DEFAULT: '#475569',  // Neutral slate grey
          muted: '#64748B',
          dark: '#334155',
        },
        sage: {
          DEFAULT: '#F1F5F9',  // Cool light grey-slate tag background
          light: '#F8FAFC',
          dark: '#E2E8F0',
        },
        stone: {
          DEFAULT: '#E5E7EB',  // Clean neutral 1px border
          light: '#F3F4F6',    // Very subtle divider
          dark: '#CBD5E1',     // Emphasized border
        },
        terracotta: {
          DEFAULT: '#EA580C',  // High severity orange
          light: '#FB923C',
          tint: '#FFF7ED',
        },
        amber: {
          DEFAULT: '#D97706',  // Medium severity amber
          tint: '#FFFBEB',
        },
        crimson: {
          DEFAULT: '#DC2626',  // Critical severity red
          tint: '#FEF2F2',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        serif: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};

export default config;
