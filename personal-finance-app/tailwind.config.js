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
            light: '#F7FAFC',
            dark: '#152039',
          },
          card: {
            light: '#FFFFFF',
            dark: '#1E2D47',
          },
        },
        // Text colors
        text: {
          primary: {
            light: '#1A202C',
            dark: '#FFFFFF',
          },
          secondary: {
            light: '#4A5568',
            dark: '#A0AEC0',
          },
          tertiary: {
            light: '#718096',
            dark: '#718096',
          },
        },
        // Border
        border: {
          light: '#E2E8F0',
          dark: '#2D3748',
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
