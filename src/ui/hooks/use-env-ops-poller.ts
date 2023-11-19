import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLoader, useQuery } from "saga-query/react";

import {
  cancelEnvOperationsPoll,
  fetchAllEnvOps,
  pollEnvOperations,
} from "@app/deploy";

export const useEnvOpsPoller = ({
  appId,
  envId,
}: {
  appId: string;
  envId: string;
}) => {
  const dispatch = useDispatch();
  useQuery(fetchAllEnvOps({ envId }));
  const pollAction = pollEnvOperations({ envId });
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
