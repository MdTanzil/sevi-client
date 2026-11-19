import { createTheme } from "@mui/material/styles";

// Sevi brand theme — same colors as the previous daisyUI theme:
// primary purple #723182, secondary yellow #fdc800, Poppins body font.
const theme = createTheme({
  palette: {
    primary: {
      main: "#723182",
    },
    secondary: {
      main: "#fdc800",
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
  },
});

export default theme;
