import { useContext } from "react";
import { ThemeModeContext } from "../provider/ThemeModeProvider";

const useThemeMode = () => {
  return useContext(ThemeModeContext);
};

export default useThemeMode;
