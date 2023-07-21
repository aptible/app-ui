import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLoader } from "saga-query/react";

import { cancelEnvOperationsPoll, pollEnvAllOperations } from "@app/deploy";

export const useEnvOpsPoller = ({
  appId,
  envId,
}: {
  appId: string;
  envId: string;
}) => {
  const dispatch = useDispatch();
  const pollAction = pollEnvAllOperations({ envId });
  const pollLoader = useLoader(pollAction);
  useEffect(() => {
    const cancel = () => dispatch(cancelEnvOperationsPoll());
    cancel();
    dispatch(pollAction);

    return () => {
      cancel();
    };
  }, [appId, envId]);

  return pollLoader;
};
