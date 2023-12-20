import { Action, batchActions } from "@app/fx";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
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
      dispatch(batchActions([cancel, action]));
    } else {
      dispatch(cancel);
    }

    return () => {
      dispatch(cancel);
    };
  }, [isTabActive, action, cancel]);
};
