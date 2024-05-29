import type { Action } from "@app/fx";
import { useDispatch } from "@app/react";
import { useEffect } from "react";
import { useVisibility } from "./use-visibility";

export const usePoller = ({
  action,
  cancel,
}: {
  action: Action;
  cancel: Action;
}) => {
  const dispatch = useDispatch();
  const isTabActive = useVisibility();

  // track if browser tab is active
  // and suspend poller when tab is inactive
  useEffect(() => {
    if (isTabActive) {
      dispatch(cancel);
      dispatch(action);
    } else {
      dispatch(cancel);
    }

    return () => {
      dispatch(cancel);
    };
  }, [isTabActive, action, cancel]);
};
