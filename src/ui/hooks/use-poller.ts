import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Action, batchActions } from "saga-query";

export const usePoller = ({
  action,
  cancel,
  heartbeatFunc,
}: {
  action: Action;
  cancel: Action;
  heartbeatFunc?: (date: Date) => void;
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    setInterval(() => {
      if (heartbeatFunc) {
        heartbeatFunc(new Date());
      }
    }, 1000);
  }, [heartbeatFunc]);

  useEffect(() => {
    dispatch(batchActions([cancel, action]));
    return () => {
      dispatch(cancel);
    };
  }, [action, cancel]);
};
