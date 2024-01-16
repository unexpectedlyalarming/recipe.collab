import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#00e676",
    },
    secondary: {
      main: "#aa00ff",
    },
    background: {
      default: "#000000",
    },
    warning: {
      main: "#ffca28",
    },
    error: {
      main: "#f44336",
    },
    info: {
      main: "#ba68c8",
    },
    success: {
      main: "#00c853",
    },
  },
  typography: {
    fontFamily: "Open Sans",
    h1: {
      fontFamily: "Open Sans",
      fontWeight: 700,
    },
    h2: {
      fontFamily: "Open Sans",
      fontWeight: 400,
    },
    fontSize: 14,
  },
  props: {
    MuiContainer: {
      maxWidth: "xl",
      padding: "2rem",
    },
  },
  shape: {
    borderRadius: 4,
  },
  spacing: 8,
});

export default theme;
