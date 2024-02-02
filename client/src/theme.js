import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#09b852",
    },
    secondary: {
      main: "#aa00ff",
    },
    background: {
      default: "#eeeeee",
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
    unselected: {
      main: "#9e9e9e",
    },
    star: {
      main: "#fdd835",
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
