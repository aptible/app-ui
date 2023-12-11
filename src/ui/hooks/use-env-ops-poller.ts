import {
  cancelEnvOperationsPoll,
  fetchAllEnvOps,
  pollEnvOperations,
} from "@app/deploy";
import { batchActions, useLoader, useQuery } from "@app/fx";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
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
    console.log(isTabActive);
    if (isTabActive) {
      dispatch(batchActions([cancelEnvOperationsPoll(), pollAction]));
    } else {
      dispatch(cancelEnvOperationsPoll());
    }
  }, [isTabActive, appId, envId]);

  return pollLoader;
};
