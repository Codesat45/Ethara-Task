/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        netflix: {
          red: "#E50914",
          "red-dark": "#B20710",
          "red-light": "#FF1A1A",
          black: "#141414",
          "dark-1": "#1a1a1a",
          "dark-2": "#222222",
          "dark-3": "#2a2a2a",
          "dark-4": "#333333",
          gray: "#808080",
          "gray-light": "#b3b3b3",
          white: "#FFFFFF",
        },
      },
      fontFamily: {
        netflix: ["'Netflix Sans'", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
      },
      backgroundImage: {
        "netflix-gradient": "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.9) 100%)",
        "hero-gradient": "linear-gradient(135deg, #141414 0%, #1a0000 50%, #141414 100%)",
        "card-gradient": "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)",
        "red-glow": "radial-gradient(ellipse at center, rgba(229,9,20,0.15) 0%, transparent 70%)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideUp: { "0%": { opacity: 0, transform: "translateY(20px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        slideDown: { "0%": { opacity: 0, transform: "translateY(-10px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        scaleIn: { "0%": { opacity: 0, transform: "scale(0.95)" }, "100%": { opacity: 1, transform: "scale(1)" } },
        glowPulse: { "0%,100%": { boxShadow: "0 0 20px rgba(229,9,20,0.3)" }, "50%": { boxShadow: "0 0 40px rgba(229,9,20,0.6)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
      },
      boxShadow: {
        "netflix": "0 4px 30px rgba(229,9,20,0.2)",
        "netflix-lg": "0 8px 50px rgba(229,9,20,0.3)",
        "dark": "0 4px 20px rgba(0,0,0,0.5)",
        "dark-lg": "0 8px 40px rgba(0,0,0,0.7)",
      },
    },
  },
  plugins: [],
}
