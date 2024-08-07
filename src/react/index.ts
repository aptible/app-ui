import { selectLoaderComposite } from "@app/loaders";
import { type WebState, schema } from "@app/schema";
import { useEffect, useRef } from "react";
import type { LoaderState, ThunkAction } from "starfx";
import {
  type TypedUseSelectorHook,
  useSelector as useBaseSelector,
  useDispatch,
} from "starfx/react";
export const useSelector: TypedUseSelectorHook<WebState> = useBaseSelector;

export {
  useDispatch,
  PersistGate,
  Provider,
} from "starfx/react";

type ActionFn<P = any> = (p: P) => { toString: () => string };
type ActionFnSimple = () => { toString: () => string };

export interface UseApiProps<P = any> extends LoaderState {
  trigger: (p: P) => void;
  action: ActionFn<P>;
}
export interface UseApiSimpleProps extends LoaderState {
  trigger: () => void;
  action: ActionFn;
}
export interface UseApiAction<A extends ThunkAction = ThunkAction>
  extends LoaderState {
  trigger: () => void;
  action: A;
}
export type UseApiResult<P, A extends ThunkAction = ThunkAction> =
  | UseApiProps<P>
  | UseApiSimpleProps
  | UseApiAction<A>;

interface UseCacheResult<D = any, A extends ThunkAction = ThunkAction>
  extends UseApiAction<A> {
  data: D | null;
}

function getActionId(action: ThunkAction | ActionFn) {
  return typeof action === "function" ? `${action}` : action.payload.key;
}

export function useLoader(action: ThunkAction | ActionFn) {
  const id = getActionId(action);
  return useSelector((s: WebState) => schema.loaders.selectById(s, { id }));
}

export function useCompositeLoader(actions: (ThunkAction | ActionFn)[]) {
  const ids = actions.map((a) => getActionId(a));
  return useSelector((s) => selectLoaderComposite(s, { ids }));
}

export function useApi<P = any, A extends ThunkAction = ThunkAction<P>>(
  action: A,
): UseApiAction<A>;
export function useApi<P = any, A extends ThunkAction = ThunkAction<P>>(
  action: ActionFn<P>,
): UseApiProps<P>;
export function useApi<A extends ThunkAction = ThunkAction>(
  action: ActionFnSimple,
): UseApiSimpleProps;
export function useApi(action: any): any {
  const dispatch = useDispatch();
  const loader = useLoader(action);
  const trigger = (p: any) => {
    if (typeof action === "function") {
      dispatch(action(p));
    } else {
      dispatch(action);
    }
  };
  return { ...loader, trigger, action };
}

export function useQuery<P = any, A extends ThunkAction = ThunkAction<P>>(
  action: A,
): UseApiAction<A> {
  const api = useApi(action);
  useEffect(() => {
    api.trigger();
  }, [action.payload.key]);
  return api;
}

export function useCache<P = any, ApiSuccess = any>(
  action: ThunkAction<P, ApiSuccess>,
): UseCacheResult<typeof action.payload._result, ThunkAction<P, ApiSuccess>> {
  const id = action.payload.key;
  const data: any = useSelector((s: WebState) =>
    schema.cache.selectById(s, { id }),
  );
  const query = useQuery(action);
  return { ...query, data: data || null };
}

export function useLoaderSuccess(
  cur: Pick<LoaderState, "status">,
  success: () => any,
) {
  const prev = useRef(cur);
  useEffect(() => {
    if (prev.current.status !== "success" && cur.status === "success") {
      success();
    }
    prev.current = cur;
  }, [cur.status]);
}
