/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "x-black": "#000000",
        "x-dark": "#16181C",
        "x-darker": "#0F1419",
        "x-border": "#2F3336",
        "x-gray": "#71767B",
        "x-light-gray": "#E7E9EA",
        "x-white": "#FFFFFF",
        "x-blue": "#1D9BF0",
        "x-blue-hover": "#1A8CD8",
        "x-red": "#F91880",
        "x-green": "#00BA7C",
      },
      fontFamily: {
        x: ["Helvetica Neue", "Arial", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
      },
      maxWidth: {
        "x-main": "40rem", // 640px, matches new .x-main
        "x-sidebar": "256px",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out infinite 2s",
        "float-slow": "float 8s ease-in-out infinite 4s",
        "gradient-x": "gradient-x 3s ease infinite",
        "text-shimmer": "text-shimmer 2s ease-in-out infinite alternate",
        "color-cycle": "color-cycle 4s ease-in-out infinite",
        "fade-in-out": "fadeInOut 2s cubic-bezier(0.4,0,0.2,1)",
        "bounce-in": "bounceIn 1s cubic-bezier(0.68,-0.55,0.27,1.55)",
        "slide-in": "slideIn 1.2s cubic-bezier(0.4,0,0.2,1)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "gradient-x": {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
        "text-shimmer": {
          "0%": {
            "background-position": "0% 50%",
          },
          "100%": {
            "background-position": "100% 50%",
          },
        },
        "color-cycle": {
          "0%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
          "100%": { "background-position": "0% 50%" },
        },
        fadeInOut: {
          "0%": { opacity: 0 },
          "10%": { opacity: 1 },
          "90%": { opacity: 1 },
          "100%": { opacity: 0 },
        },
        bounceIn: {
          "0%": { transform: "scale(0.3)" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)" },
        },
        slideIn: {
          "0%": { opacity: 0, transform: "translateX(40px)" },
          "100%": { opacity: 1, transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
