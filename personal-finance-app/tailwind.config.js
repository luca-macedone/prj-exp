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
        // Primary colors
        primary: {
          DEFAULT: '#007AFF',
          light: '#4DA3FF',
          dark: '#0056CC',
        },
        // Background colors
        background: {
          primary: {
            light: '#FFFFFF',
            dark: '#0A1628',
          },
          secondary: {
            light: '#F3F4F6',
            dark: '#152039',
          },
          card: {
            light: '#FFFFFF',
            dark: '#1E2D47',
          },
          hover: {
            light: '#E5E7EB',
            dark: '#1F2937',
          },
        },
        // Text colors
        text: {
          primary: {
            light: '#111827',
            dark: '#F9FAFB',
          },
          secondary: {
            light: '#6B7280',
            dark: '#D1D5DB',
          },
          tertiary: {
            light: '#9CA3AF',
            dark: '#9CA3AF',
          },
        },
        // Border
        border: {
          light: '#D1D5DB',
          dark: '#374151',
        },
        // Status colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        // Category colors
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
      },
    },
  },
  plugins: [],
}
