// client/src/utils/themeStorage.js

const THEME_KEY = "app_theme";

export const getTheme = () => {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return saved || "light";
  } catch (err) {
    console.error("Error loading theme:", err);
    return "light";
  }
};

export const saveTheme = (theme) => {
  try {
    localStorage.setItem(THEME_KEY, theme);
    console.log("Theme saved:", theme);
  } catch (err) {
    console.error("Error saving theme:", err);
  }
};

export const toggleTheme = (currentTheme) => {
  const newTheme = currentTheme === "light" ? "dark" : "light";
  saveTheme(newTheme);
  return newTheme;
};

export const applyTheme = (theme) => {
  document.documentElement.setAttribute("data-theme", theme);
};
