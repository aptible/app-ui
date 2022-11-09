import { createAssign, createReducerMap } from "@app/slice-helpers";
import { AppState, Theme } from "@app/types";

const getDefaultTheme = (): Theme => {
  if (typeof window === "undefined") {
    return "light";
  }
  if (typeof window.matchMedia !== "function") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};
const defaultTheme = getDefaultTheme();

export const THEME_NAME = "theme";
const slice = createAssign<Theme>({
  name: THEME_NAME,
  initialState: defaultTheme,
});
export const { set: setTheme } = slice.actions;
export const selectTheme = (s: AppState) => s[THEME_NAME] || defaultTheme;

export const reducers = createReducerMap(slice);
