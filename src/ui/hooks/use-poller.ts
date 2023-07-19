import { Action, batchActions } from "@app/fx";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export const usePoller = ({
  action,
  cancel,
  skip = false,
}: {
  action: Action;
  cancel: Action;
  skip?: boolean;
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (skip) {
      return;
    }
    dispatch(batchActions([cancel, action]));
    return () => {
      dispatch(cancel);
    };
  }, [action, cancel]);
};
