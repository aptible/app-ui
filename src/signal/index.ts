import { resetStore } from "@app/reset-store";
import { createAssign, createReducerMap } from "@app/slice-helpers";
import { AppState } from "@app/types";
import { put, select, take } from "saga-query";

export const SIGNAL_NAME = "signal";
const slice = createAssign({
  name: SIGNAL_NAME,
  initialState: new AbortController(),
});
export const { set: setSignal } = slice.actions;
export const selectSignal = (s: AppState) => s[SIGNAL_NAME];
export const reducers = createReducerMap(slice);

export function* watchSignal() {
  while (true) {
    yield* take(`${resetStore}`);
    const signal = yield* select(selectSignal);
    signal.abort("reset store");
    yield* put(setSignal(new AbortController()));
  }
}
