import { useEffect, useState } from "react";

const useTheme = (): [string, (e: KeyboardEvent) => void, boolean] => {
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  const setMode = (mode: string) => {
    window.localStorage.setItem("theme", mode);
    setTheme(mode);
  };

  const toggleTheme = (e: KeyboardEvent) => {
    if (e.metaKey) {
      setMode("girth");
    } else {
      if (theme === "light") {
        setMode("dark");
      } else {
        setMode("light");
      }
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return [theme, toggleTheme, mounted];
};

export default useTheme;
