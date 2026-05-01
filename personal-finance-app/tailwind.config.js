/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // === SEMANTIC COLORS ===
        primary: {
          DEFAULT: { light: '#1E40AF', dark: '#60A5FA' },
          foreground: { light: '#FFFFFF', dark: '#0F172A' },
        },
        secondary: {
          DEFAULT: { light: '#F1F5F9', dark: '#334155' },
          foreground: { light: '#0F172A', dark: '#F1F5F9' },
        },
        muted: {
          DEFAULT: { light: '#F1F5F9', dark: '#334155' },
          foreground: { light: '#64748B', dark: '#94A3B8' },
        },
        accent: {
          DEFAULT: { light: '#DBEAFE', dark: '#1E3A8A' },
          foreground: { light: '#1E40AF', dark: '#DBEAFE' },
        },
        destructive: {
          DEFAULT: { light: '#EF4444', dark: '#F87171' },
          foreground: { light: '#FFFFFF', dark: '#0F172A' },
        },

        // === BACKGROUND ===
        background: {
          DEFAULT: { light: '#FAFBFC', dark: '#0F172A' },
          secondary: { light: '#F1F5F9', dark: '#152039' },
          card: { light: '#FFFFFF', dark: '#1E293B' },
          input: { light: '#F8FAFC', dark: '#334155' },
          hover: { light: '#E5E7EB', dark: '#1F2937' },
        },

        // === TEXT ===
        foreground: {
          DEFAULT: { light: '#0F172A', dark: '#F1F5F9' },
          secondary: { light: '#64748B', dark: '#94A3B8' },
          tertiary: { light: '#9CA3AF', dark: '#9CA3AF' },
        },

        // === BORDER & RING ===
        border: { light: '#E2E8F0', dark: '#334155' },
        ring: { light: '#93C5FD', dark: '#3B82F6' },

        // === STATUS COLORS ===
        success: {
          DEFAULT: { light: '#10B981', dark: '#34D399' },
          foreground: { light: '#FFFFFF', dark: '#0F172A' },
        },
        warning: {
          DEFAULT: { light: '#F59E0B', dark: '#FBBF24' },
          foreground: { light: '#FFFFFF', dark: '#0F172A' },
        },
        error: {
          DEFAULT: { light: '#EF4444', dark: '#F87171' },
          foreground: { light: '#FFFFFF', dark: '#0F172A' },
        },
        info: {
          DEFAULT: { light: '#3B82F6', dark: '#60A5FA' },
          foreground: { light: '#FFFFFF', dark: '#0F172A' },
        },

        // === CHART COLORS ===
        chart: {
          1: { light: '#3B82F6', dark: '#60A5FA' },
          2: { light: '#10B981', dark: '#34D399' },
          3: { light: '#F59E0B', dark: '#FBBF24' },
          4: { light: '#8B5CF6', dark: '#A78BFA' },
          5: { light: '#EC4899', dark: '#F472B6' },
        },

        // === CATEGORY COLORS (app-specific) ===
        category: {
          food: '#FF6B6B',
          transport: '#4ECDC4',
          shopping: '#FFD93D',
          bills: '#6C5CE7',
          entertainment: '#FF8787',
          health: '#A8E6CF',
          education: '#95E1D3',
          salary: '#4CAF50',
          investment: '#00BCD4',
          other: '#95A5A6',
        },

        // === SIDEBAR (if needed for web) ===
        sidebar: {
          DEFAULT: { light: '#FFFFFF', dark: '#1E293B' },
          foreground: { light: '#0F172A', dark: '#F1F5F9' },
          primary: { light: '#1E40AF', dark: '#60A5FA' },
          accent: { light: '#F1F5F9', dark: '#334155' },
          border: { light: '#E2E8F0', dark: '#334155' },
        },
      },

      borderRadius: {
        sm: '0.5rem',    // 8px
        DEFAULT: '0.75rem', // 12px (--radius from Figma)
        md: '0.625rem',  // 10px
        lg: '0.75rem',   // 12px
        xl: '1rem',      // 16px
      },

      fontWeight: {
        normal: '400',
        medium: '500',
      },
    },
  },
  plugins: [],
}