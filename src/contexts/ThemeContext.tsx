import React, { createContext, useContext } from 'react';
import { DARK_THEME, LIGHT_THEME } from '../constants/theme';
import { useSettingsStore } from '../store/useSettingsStore';

type Theme = typeof DARK_THEME;

const ThemeContext = createContext<Theme>(DARK_THEME);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSettingsStore(s => s.theme);
  const accent = useSettingsStore(s => s.accent);

  const baseTheme = theme === 'light' ? LIGHT_THEME : DARK_THEME;
  const activeTheme = { ...baseTheme, accent };

  return (
    <ThemeContext.Provider value={activeTheme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
