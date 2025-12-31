import { useEffect, useState } from "react";

export const UseTheme = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") || "system";
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = (theme) => {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else if (theme === "light") {
        document.documentElement.classList.remove("dark");
      } else {
        document.documentElement.classList.toggle("dark", mediaQuery.matches);
      }
    };

    applyTheme(darkMode);

    if (darkMode !== "system") {
      localStorage.setItem("theme", darkMode);
    } else {
      localStorage.removeItem("theme");
    }

    if (darkMode === "system") {
      const handler = (e) => {
        document.documentElement.classList.toggle("dark", e.matches);
      };
      mediaQuery.addEventListener("change", handler);

      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [darkMode]);

  return [darkMode, setDarkMode];
};
