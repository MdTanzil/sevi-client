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
      // and dialogs (category/user/borrow forms, confirmations) must not
      // lock body scroll: MUI's scroll lock adds a padding-right
      // compensation to the body, which shifts the whole page sideways
      // every time a menu or dialog opens. Disabling it here covers all
      // menus and dialogs at once; nothing in the app relies on their
      // scroll lock. The mobile dashboard Drawer keeps its own lock.
      MuiMenu: {
        defaultProps: {
          disableScrollLock: true,
        },
      },
      MuiDialog: {
        defaultProps: {
          disableScrollLock: true,
        },
      },
    },
  });

export default createSeviTheme;
