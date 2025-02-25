import { type DashboardContents, handleDashboardEvent } from "@app/aptible-ai";
import { selectAptibleAiUrl } from "@app/config";
import { fetchDashboard, selectDashboardById } from "@app/deploy/dashboard";
import { findLoaderComposite } from "@app/loaders";
import { useQuery, useSelector } from "@app/react";
import { selectAccessToken } from "@app/token";
import { DeployDashboard } from "@app/types/deploy";
import { useEffect, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

type UseDashboardParams = {
  id: string;
};

type UseHotshotDashboardParams = {
  dashboard: DeployDashboard;
  isDashboardLoading: boolean;
  setDashboardContents: React.Dispatch<React.SetStateAction<DashboardContents>>;
}

export const useDashboard = ({ id }: UseDashboardParams) => {
  const [dashboardContents, setDashboardContents] = useState<DashboardContents>({
    resources: {},
    messages: [],
    summary: "",
    ranked_plots: [],
  });

  const { dashboard, isDashboardLoading } = useLoadedDashboard({ id });
  const { socketReadyState } = useHotshotDashboard({ dashboard, isDashboardLoading, setDashboardContents });

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
}

const useHotshotDashboard = ({ dashboard, isDashboardLoading, setDashboardContents }: UseHotshotDashboardParams) => {
  const aptibleAiUrl = useSelector(selectAptibleAiUrl);
  const accessToken = useSelector(selectAccessToken);
  const [socketReadyState, setSocketReadyState] = useState<ReadyState>(ReadyState.UNINSTANTIATED);

  // Only enable socket if the dashboard has loaded and there is no saved data
  const shouldEnableSocket = !isDashboardLoading && Object.entries(dashboard.data).length == 0;

  const { lastJsonMessage: event, readyState: wsReadyState } = useWebSocket<Record<string, any>>(
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
    shouldEnableSocket
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
}
