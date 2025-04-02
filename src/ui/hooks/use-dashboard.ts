import { type DashboardContents, handleDashboardEvent } from "@app/aptible-ai";
import { selectAptibleAiUrl } from "@app/config";
import { updateDashboard } from "@app/deploy/dashboard";
import { fetchDashboard, selectDashboardById } from "@app/deploy/dashboard";
import { useDispatch, useQuery, useSelector } from "@app/react";
import { camelToSnakeCase } from "@app/string-utils";
import { selectAccessToken } from "@app/token";
import type { DeployDashboard } from "@app/types/deploy";
import { useEffect, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

const DASHBOARD_SAVE_DEBOUNCE_MS = 1000;

type UseDashboardParams = {
  id: string;
};

type UseHotshotDashboardParams = {
  dashboard: DeployDashboard;
  useHotshot: boolean;
  setDashboardContents: React.Dispatch<React.SetStateAction<DashboardContents>>;
  setLoadingComplete: React.Dispatch<React.SetStateAction<boolean>>;
};

export const useDashboard = ({ id }: UseDashboardParams) => {
  const { isSuccess: isDashboardLoaded } = useQuery(fetchDashboard({ id }));
  const dashboard = useSelector((s) => selectDashboardById(s, { id }));
  const dispatch = useDispatch();
  const [useHotshot, setUseHotshot] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [debouncedDashboardContents, setDebouncedDashboardContents] =
    useState<DashboardContents>();
  const [dashboardContents, setDashboardContents] = useState<DashboardContents>(
    {
      resources: {},
      messages: [],
      summary: "",
      ranked_plots: [],
    },
  );
  useHotshotDashboard({
    dashboard,
    useHotshot,
    setDashboardContents,
    setLoadingComplete,
  });

  useEffect(() => {
    if (isDashboardLoaded) {
      if (Object.entries(dashboard.data).length > 0) {
        // If we have saved content from the backend, use it
        setDashboardContents(dashboard.data as DashboardContents);
        setLoadingComplete(true);
      } else {
        // Otherwise, get data from Hotshot
        setUseHotshot(true);
      }
    }
  }, [isDashboardLoaded]);

  // Debounce to limit backend requests as Hotshot data comes in
  useEffect(() => {
    if (debouncedDashboardContents) {
      dispatch(
        updateDashboard({ id: dashboard.id, data: debouncedDashboardContents }),
      );
    }
  }, [debouncedDashboardContents]);

  useEffect(() => {
    if (!isDashboardLoaded) {
      return;
    }

    // If the dashboardContents is the same as what we have saved on the
    // backend, don't save it again
    if (JSON.stringify(dashboardContents) === JSON.stringify(dashboard.data)) {
      return;
    }

    const handler = setTimeout(() => {
      setDebouncedDashboardContents(dashboardContents);
    }, DASHBOARD_SAVE_DEBOUNCE_MS);

    // Clear the timeout if dashboardContents changes before the debounce
    return () => clearTimeout(handler);
  }, [dashboardContents, isDashboardLoaded]);

  return {
    dashboard,
    dashboardContents,
    loadingComplete,
  };
};

const useHotshotDashboard = ({
  dashboard,
  useHotshot,
  setDashboardContents,
  setLoadingComplete,
}: UseHotshotDashboardParams) => {
  const aptibleAiUrl = useSelector(selectAptibleAiUrl);
  const accessToken = useSelector(selectAccessToken);

  const { lastJsonMessage: event, readyState: wsReadyState } = useWebSocket<
    Record<string, any>
  >(
    `${aptibleAiUrl}/troubleshoot`,
    {
      queryParams: {
        token: accessToken,
        resource_id: dashboard.resourceId,
        resource_type: camelToSnakeCase(dashboard.resourceType),
        symptom_description: dashboard.symptoms,
        start_time: dashboard.rangeBegin,
        end_time: dashboard.rangeEnd,
      },
      heartbeat: {
        timeout: 60000 * 30, // 30 minutes
      },
    },
    useHotshot,
  );

  useEffect(() => {
    if (event) {
      setDashboardContents((prevDashboard) =>
        handleDashboardEvent(prevDashboard, event),
      );
    }
  }, [JSON.stringify(event)]);

  useEffect(() => {
    if (wsReadyState === ReadyState.CLOSED) {
      setLoadingComplete(true);
    }
  }, [wsReadyState]);
};
