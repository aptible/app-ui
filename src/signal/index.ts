import { createAssign, createReducerMap } from "@app/slice-helpers";
import { AppState } from "@app/types";

export const SIGNAL_NAME = "signal";
const slice = createAssign({
  name: SIGNAL_NAME,
  initialState: new AbortController(),
});
export const { set: setSignal } = slice.actions;
export const selectSignal = (s: AppState) => s[SIGNAL_NAME];
export const reducers = createReducerMap(slice);
