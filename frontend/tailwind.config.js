/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F7FCFA',
          100: '#E5F5F0',
          200: '#45A180',
          300: '#009963',
          400: '#0D1C17',
        },
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E8EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        }
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
      },
      height: {
        '14': '56px',
        '80': '320px',
      }
    },
  },
  plugins: [],
}
