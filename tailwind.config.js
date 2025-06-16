module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // <--- THIS LINE IS CRUCIAL
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2c3e50', secondary: '#3498db', danger: '#e74c3c', warning: '#f39c12',
        success: '#2ecc71', light: '#ecf0f1', dark: '#34495e', gray: '#95a5a6',
        'danger-light': 'rgba(231, 76, 60, 0.15)', 'warning-light': 'rgba(243, 156, 18, 0.15)',
        'success-light': 'rgba(46, 204, 113, 0.15)', 'danger-dark': 'var(--danger)',
        'warning-dark': 'var(--warning)', 'success-dark': 'var(--success)',
      },
    },
  },
  plugins: [],
}