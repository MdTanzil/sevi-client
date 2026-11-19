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
    components: {
      // Menus (avatar dropdown, mobile hamburger menu, notification bell)
      // must not lock body scroll: MUI's scroll lock adds a padding-right
      // compensation to the body, which shifts the whole page left every
      // time a menu opens. Disabling it here covers all menus at once;
      // nothing in the app relies on menu scroll lock (no Dialog/Modal
      // is used anywhere, and SweetAlert2 manages its own overlay).
      MuiMenu: {
        defaultProps: {
          disableScrollLock: true,
        },
      },
    },
  });

export default createSeviTheme;
