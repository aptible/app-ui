import { createSelector, createSlice } from "@reduxjs/toolkit";
import { delay, put, select } from "saga-query";

import { createReducerMap } from "@app/slice-helpers";
import { ActionWithPayload, AppState, Toast } from "@app/types";

export type UpdateToast = Pick<Toast, "id" | "isActive" | "dismissAt">;

const MAX_ACTIVE_TOASTS = 10;
const DEFAULT_TOAST_DURATION = 5000;
const SYNC_WAIT = 100;

function noop() {}
function idCreator() {
  let id = 1;
  return () => {
    id += 1;
    return id;
  };
}
const createId = idCreator();
export const defaultToast = (t: Partial<Toast> = {}): Toast => {
  const duration = t.duration;
  return {
    id: createId(),
    type: "default",
    text: "",
    cta: noop,
    ctaText: "",
    isActive: false,
    duration,
    dismissAt: dismissAt(duration),
    ...t,
  };
};

export const TOAST_NAME = "toast";
const initToast: Toast[] = [];
const toast = createSlice({
  name: TOAST_NAME,
  initialState: initToast,
  reducers: {
    queueToasts: (state, action: ActionWithPayload<Toast[]>) => {
      return [...state, ...action.payload];
    },
    patchToasts: (state, action: ActionWithPayload<UpdateToast[]>) => {
      const tt = action.payload;
      return state.map((s) => {
        const findToast = tt.find((t) => t.id === s.id);
        if (!findToast) return s;
        return { ...s, ...findToast };
      });
    },
    removeToasts: (state, action: ActionWithPayload<number[]>) => {
      return state.filter((s) => {
        const found = action.payload.find((id) => id === s.id);
        return !found;
      });
    },
    resetToasts: () => initToast,
  },
});
const { queueToasts, patchToasts, removeToasts } = toast.actions;
export { queueToasts };

const selectToasts = (state: AppState) => state[TOAST_NAME] || initToast;
const selectInactiveToasts = createSelector(selectToasts, (toasts) =>
  toasts.filter((t) => !t.isActive),
);
export const selectActiveToasts = createSelector(selectToasts, (toasts) =>
  toasts.filter((t) => t.isActive),
);
const selectActiveToastsCount = createSelector(
  selectActiveToasts,
  (toasts) => toasts.length,
);
const selectToastsToActivate = createSelector(
  selectInactiveToasts,
  selectActiveToastsCount,
  (toasts, activeCount) => {
    if (activeCount >= MAX_ACTIVE_TOASTS) {
      return [];
    }

    const delta = Math.min(toasts.length, MAX_ACTIVE_TOASTS - activeCount);
    if (delta === 0) {
      return [];
    }

    const activate: UpdateToast[] = [];
    for (let i = 0; i < delta; i += 1) {
      const toast = toasts[i];
      activate.push({
        id: toast.id,
        isActive: true,
        dismissAt: dismissAt(toast.duration),
      });
    }

    return activate;
  },
);
const selectToastsToRemove = (state: AppState) => {
  const toasts = selectActiveToasts(state);
  return toasts
    .filter((t) => {
      const now = new Date();
      return now > new Date(t.dismissAt);
    })
    .map((t) => t.id);
};

export const reducers = createReducerMap(toast);

const dismissAt = (duration = DEFAULT_TOAST_DURATION) => {
  const t = new Date();
  t.setMilliseconds(t.getMilliseconds() + duration);
  return t.toISOString();
};

export function* toastAdder() {
  while (true) {
    const toasts = yield* select(selectToastsToActivate);
    if (toasts.length > 0) {
      yield* put(patchToasts(toasts));
    }
    yield* delay(SYNC_WAIT);
  }
}

export function* toastCleaner() {
  while (true) {
    const toasts = yield* select(selectToastsToRemove);
    if (toasts.length > 0) {
      yield* put(removeToasts(toasts));
    }
    yield* delay(SYNC_WAIT);
  }
}
