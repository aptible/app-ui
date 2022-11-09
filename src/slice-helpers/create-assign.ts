import { ActionWithPayload } from "@app/types";
import { createSlice } from "@reduxjs/toolkit";

export function createAssign<S = any>({
  name,
  initialState,
}: {
  name: string;
  initialState: S;
}) {
  return createSlice({
    name,
    initialState,
    reducers: {
      set: (_, action: ActionWithPayload<S>) => action.payload,
      reset: () => initialState,
    },
  });
}
