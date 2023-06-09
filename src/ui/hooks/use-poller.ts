import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Action, batchActions } from "saga-query";

export const usePoller = ({
  action,
  cancel,
}: {
  action: Action;
  cancel: Action;
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(batchActions([cancel, action]));
    return () => {
      dispatch(cancel);
    };
  }, [action, cancel]);
};
