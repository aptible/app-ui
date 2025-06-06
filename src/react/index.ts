import { selectLoaderComposite } from "@app/loaders";
import type { WebState } from "@app/schema";
import type { ThunkAction } from "starfx";
import {
  type TypedUseSelectorHook,
  useSelector as useBaseSelector,
} from "starfx/react";
export const useSelector: TypedUseSelectorHook<WebState> = useBaseSelector;

export {
  useDispatch,
  PersistGate,
  Provider,
  useLoader,
  useApi,
  useQuery,
  useCache,
  useLoaderSuccess,
} from "starfx/react";

type ActionFn<P = any> = (p: P) => { toString: () => string };

function getActionId(action: ThunkAction | ActionFn) {
  return typeof action === "function" ? `${action}` : action.payload.key;
}

export function useCompositeLoader(actions: (ThunkAction | ActionFn)[]) {
  const ids = actions.map((a) => getActionId(a));
  return useSelector((s) => selectLoaderComposite(s, { ids }));
}
