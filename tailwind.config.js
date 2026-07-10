export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Inter", "ui-sans-serif", "system-ui"],
        body: ["Inter", "ui-sans-serif", "system-ui"]
      },
      colors: {
        ink: "#050505",
        panel: "rgba(255,255,255,0.07)",
        line: "rgba(255,255,255,0.12)"
      },
      boxShadow: {
        glow: "0 0 60px rgba(89, 111, 255, 0.24)",
        card: "0 24px 80px rgba(0, 0, 0, 0.42)"
      }
    }
  },
  plugins: []
};
