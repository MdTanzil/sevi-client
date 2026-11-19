import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { PropTypes } from "prop-types";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import createSeviTheme from "../theme";

export const ThemeModeContext = createContext({
  mode: "light",
  toggleMode: () => {},
});

const STORAGE_KEY = "sevi-theme";

const readStoredMode = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "dark"
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
};

/**
 * Holds the light/dark mode at the app root: initialized from
 * localStorage ("sevi-theme", default "light"), persisted on change, and
 * passed to MUI's ThemeProvider. Also toggles a `dark` class on <html>
 * so native UI (scrollbars, form controls, date pickers) can restyle
 * itself via the rules in index.css.
 */
const ThemeModeProvider = ({ children }) => {
  const [mode, setMode] = useState(readStoredMode);

  const toggleMode = useCallback(
    () => setMode((current) => (current === "light" ? "dark" : "light")),
    []
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Private browsing or blocked storage — the mode still works
      // for this session, it just won't be remembered.
    }
    document.documentElement.classList.toggle("dark", mode === "dark");
    // Keep the pre-paint background from index.html in sync when the
    // mode changes after load (otherwise a stale inline background
    // would show through around the edges on toggle).
    document.documentElement.style.backgroundColor =
      mode === "dark" ? "#121212" : "#ffffff";
  }, [mode]);

  const theme = useMemo(() => createSeviTheme(mode), [mode]);
  const value = useMemo(() => ({ mode, toggleMode }), [mode, toggleMode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

ThemeModeProvider.propTypes = {
  children: PropTypes.node,
};

export default ThemeModeProvider;
