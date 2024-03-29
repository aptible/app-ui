import {
  cancelEnvOperationsPoll,
  fetchAllEnvOps,
  pollEnvOperations,
} from "@app/deploy";
import { useDispatch, useLoader, useQuery } from "@app/react";
import { useEffect } from "react";
import { useVisibility } from "./use-visibility";

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
  const isTabActive = useVisibility();

  // track if browser tab is active
  // and suspend poller when tab is inactive
  useEffect(() => {
    if (isTabActive) {
      dispatch(cancelEnvOperationsPoll());
      dispatch(pollAction);
    } else {
      dispatch(cancelEnvOperationsPoll());
    }

    return () => {
      dispatch(cancelEnvOperationsPoll());
    };
  }, [isTabActive, appId, envId]);

  return pollLoader;
};
