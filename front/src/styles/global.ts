export const globalStyles = {
  "html, body, #root": {
    height: "100%",
    margin: 0,
    padding: 0,
    overflow: "hidden",
  },

  "*": {
    outline: "none !important",
  },
  "*:focus, *:focus-visible, *:active": {
    outline: "none !important",
    boxShadow: "none !important",
  },
  'button:focus, [role="button"]:focus, a:focus, .MuiButtonBase-root:focus': {
    outline: "none !important",
    boxShadow: "none !important",
  },

  ":root": {
    fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
    lineHeight: 1.5,
    fontWeight: 400,
    colorScheme: "light dark",
    color: "rgba(255, 255, 255, 0.87)",
    backgroundColor: "#242424",
    fontSynthesis: "none",
    textRendering: "optimizeLegibility",
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
  },

  a: {
    fontWeight: 500,
    color: "#646cff",
    textDecoration: "inherit",
  },
  "a:hover": {
    color: "#535bf2",
  },

  body: {
    display: "block",
    minWidth: "320px",
    minHeight: "100vh",
    textAlign: "left",
  },

  h1: {
    fontSize: "3.2em",
    lineHeight: 1.1,
  },

  button: {
    borderRadius: "8px",
    border: "1px solid transparent",
    padding: "0.6em 1.2em",
    fontSize: "1em",
    fontWeight: 500,
    fontFamily: "inherit",
    backgroundColor: "#1a1a1a",
    cursor: "pointer",
    transition: "border-color 0.25s",
  },
  "button:hover": {
    borderColor: "#646cff",
  },

  "@media (prefers-color-scheme: light)": {
    ":root": {
      color: "#213547",
      backgroundColor: "#ffffff",
    },
    "a:hover": {
      color: "#747bff",
    },
    button: {
      backgroundColor: "#f9f9f9",
    },
  },

  ".logo, .card, .read-the-docs": {
    display: "none",
  },
};
