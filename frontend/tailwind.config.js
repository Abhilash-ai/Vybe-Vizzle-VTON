/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        vybe: {
          bg: "#0B0D14",
          surface: "#121622",
          card: "#171D2D",
          border: "#242C40",
          subtle: "#1C2233",
          gold: "#D4AF37",
          goldLight: "#F3E5AB",
          goldMuted: "#8C7426",
          accent: "#3B82F6",
          accentLight: "#60A5FA",
          text: "#F1F5F9",
          muted: "#94A3B8",
          subtext: "#64748B"
        }
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "Inter", "-apple-system", "sans-serif"],
        serif: ["'Playfair Display'", "Georgia", "serif"],
        mono: ["'JetBrains Mono'", "monospace"]
      },
      boxShadow: {
        'luxury': '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 15px -3px rgba(212, 175, 55, 0.1)',
        'glow-gold': '0 0 25px -5px rgba(212, 175, 55, 0.25)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }
    },
  },
  plugins: [],
}
