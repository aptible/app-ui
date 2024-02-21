import { cancelAppOpsPoll, pollAppOperations } from "@app/deploy";
import { useDispatch, useQuery } from "@app/react";
import { useEffect } from "react";

export const usePollAppOperations = (appId: string) => {
  const dispatch = useDispatch();
  const appOps = useQuery(pollAppOperations({ id: appId }));
  useEffect(() => {
    const cancel = () => dispatch(cancelAppOpsPoll());
    cancel();
    dispatch(pollAppOperations({ id: appId }));
    return () => {
      cancel();
    };
  }, [appId]);

  return appOps;
};
