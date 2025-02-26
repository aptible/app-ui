import { type DashboardContents, handleDashboardEvent } from "@app/aptible-ai";
import { selectAptibleAiUrl } from "@app/config";
import { updateDashboard } from "@app/deploy/dashboard";
import { fetchDashboard, selectDashboardById } from "@app/deploy/dashboard";
import { findLoaderComposite } from "@app/loaders";
import { useDispatch, useQuery, useSelector } from "@app/react";
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
  isDashboardLoading: boolean;
  setDashboardContents: React.Dispatch<React.SetStateAction<DashboardContents>>;
};

export const useDashboard = ({ id }: UseDashboardParams) => {
  const [dashboardContents, setDashboardContents] = useState<DashboardContents>(
    {
      resources: {},
      messages: [],
      summary: "",
      ranked_plots: [],
    },
  );
  const [debouncedDashboardContents, setDebouncedDashboardContents] =
    useState(dashboardContents);

  const { dashboard, isDashboardLoading } = useLoadedDashboard({ id });
  const { socketReadyState } = useHotshotDashboard({
    dashboard,
    isDashboardLoading,
    setDashboardContents,
  });
  const dispatch = useDispatch();

  useEffect(() => {
    // If we have saved content from the backend, use it
    if (Object.entries(dashboard.data).length > 0) {
      setDashboardContents(dashboard.data as DashboardContents);
    }
  }, [dashboard]);

  // Debounce to limit backend requests as Hotshot data comes in
  useEffect(() => {
    if (debouncedDashboardContents) {
      dispatch(
        updateDashboard({ id: dashboard.id, data: debouncedDashboardContents }),
      );
    }
  }, [debouncedDashboardContents]);

  useEffect(() => {
    // TODO: add a check to make sure the dashboardContents are different from
    // dashboard.data to avoid saving the data we just loaded from the backend
    if (Object.entries(dashboardContents).length === 0) {
      return;
    }

    const handler = setTimeout(() => {
      setDebouncedDashboardContents(dashboardContents);
    }, DASHBOARD_SAVE_DEBOUNCE_MS);

    // Clear the timeout if dashboardContents changes before the debounce
    return () => clearTimeout(handler);
  }, [dashboardContents]);

  return {
    dashboard,
    dashboardContents,
    isDashboardLoading,
    socketReadyState,
  };
};

const useLoadedDashboard = ({ id }: UseDashboardParams) => {
  const dashboard = useSelector((s) => selectDashboardById(s, { id }));
  const loaderDashboard = useQuery(fetchDashboard({ id }));
  const loader = findLoaderComposite([loaderDashboard]);

  return {
    dashboard,
    isDashboardLoading: loader.isLoading,
  };
};

const useHotshotDashboard = ({
  dashboard,
  isDashboardLoading,
  setDashboardContents,
}: UseHotshotDashboardParams) => {
  const aptibleAiUrl = useSelector(selectAptibleAiUrl);
  const accessToken = useSelector(selectAccessToken);
  const [socketReadyState, setSocketReadyState] = useState<ReadyState>(
    ReadyState.UNINSTANTIATED,
  );

  // Only enable socket if the dashboard has loaded and there is no saved data
  const shouldEnableSocket =
    !isDashboardLoading && Object.entries(dashboard.data).length === 0;

  const { lastJsonMessage: event, readyState: wsReadyState } = useWebSocket<
    Record<string, any>
  >(
    `${aptibleAiUrl}/troubleshoot`,
    {
      queryParams: {
        token: accessToken,
        resource_id: dashboard.resourceId,
        symptom_description: dashboard.symptoms,
        start_time: dashboard.rangeBegin,
        end_time: dashboard.rangeEnd,
      },
    },
    shouldEnableSocket,
  );

  useEffect(() => {
    if (event) {
      setDashboardContents((prevDashboard) =>
        handleDashboardEvent(prevDashboard, event),
      );
    }
  }, [JSON.stringify(event)]);

  useEffect(() => {
    if (wsReadyState === ReadyState.OPEN) {
      setSocketReadyState(ReadyState.OPEN);
    } else if (wsReadyState === ReadyState.CLOSED) {
      setSocketReadyState(ReadyState.CLOSED);
    }
  }, [wsReadyState]);

  return {
    socketReadyState,
  };
};
