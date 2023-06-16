import { createAssign, createReducerMap } from "@app/slice-helpers";
import { AppState, Nav } from "@app/types";

const getDefaultNav = (): Nav => ({
  collapsed: false,
});
const defaultNav = getDefaultNav();

export const NAV_NAME = "nav";
const slice = createAssign<Nav>({
  name: NAV_NAME,
  initialState: defaultNav,
});
export const { set: setCollapsed } = slice.actions;
export const selectNav = (s: AppState) => s[NAV_NAME] || defaultNav;

export const reducers = createReducerMap(slice);
