/**
 * Theme utilities
 * Manage light/dark mode with localStorage persistence
 */

export const THEME_KEY = 'smart-faq-theme';
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

/**
 * Get current theme from localStorage or system preference
 */
export const getTheme = () => {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored) {
    return stored;
  }

  // Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return THEMES.DARK;
  }

  return THEMES.LIGHT;
};

/**
 * Set theme and update DOM
 */
export const setTheme = (theme) => {
  localStorage.setItem(THEME_KEY, theme);

  const html = document.documentElement;
  if (theme === THEMES.DARK) {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
};

/**
 * Toggle between light and dark themes
 */
export const toggleTheme = () => {
  const current = getTheme();
  const next = current === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
  setTheme(next);
  return next;
};

/**
 * Initialize theme on app load
 */
export const initializeTheme = () => {
  const theme = getTheme();
  setTheme(theme);
};
