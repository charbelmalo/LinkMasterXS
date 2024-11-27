 /** @type {import('tailwindcss').Config} */
 module.exports = {
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                customBlue: '#6366F1',
                customGreen: '#ffffff',
            },
            transitionDuration: {
                '300': '300ms',
            },
        },
    },
    variants: {
        extend: {
  keyframes: {
    skeleton: {
      '0%': { backgroundPosition: '-200px 0' },
      '100%': { backgroundPosition: 'calc(200px + 100%) 0' },
    },
  },
  animation: {
    skeleton: 'skeleton 1.5s infinite linear',
  },
},},
    
    plugins: [],
};