/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0D12",
        foreground: "#F4F6FB",
        card: "#151924",
        muted: "#1E2332",
        accent: "#7F8CFF",
        success: "#6BE4A6",
        warning: "#F7C873"
      },
      fontFamily: {
        sans: ["Inter", "var(--font-inter)", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glow: "0 10px 40px rgba(127, 140, 255, 0.25)"
      }
    }
  },
  plugins: []
};
