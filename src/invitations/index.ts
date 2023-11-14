import { createReducerMap } from "@app/slice-helpers";
import { invitations } from "./invitations";

export * from "./invitations";

export const reducers = createReducerMap(invitations);
