import { createTheme } from "@mui/material/styles";

// Sevi brand theme — same colors as the previous daisyUI theme:
// primary purple #723182, secondary yellow #fdc800, Poppins body font.
// The brand colors stay the same in both modes; the surfaces come from
// MUI's built-in light/dark palettes.
const createSeviTheme = (mode = "light") =>
  createTheme({
    palette: {
      mode,
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

export default createSeviTheme;
