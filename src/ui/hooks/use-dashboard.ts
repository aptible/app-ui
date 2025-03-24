import { type DashboardContents, handleDashboardEvent } from "@app/aptible-ai";
import { selectAptibleAiUrl } from "@app/config";
import { updateDashboard } from "@app/deploy/dashboard";
import { fetchDashboard, selectDashboardById } from "@app/deploy/dashboard";
import { useDispatch, useQuery, useSelector } from "@app/react";
import { selectAccessToken } from "@app/token";
import type { DeployDashboard } from "@app/types/deploy";
import { i } from "node_modules/react-router/dist/development/route-data-DuV3tXo2.mjs";
import { useEffect, useMemo, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

const DASHBOARD_SAVE_DEBOUNCE_MS = 1000;

type UseDashboardParams = {
  id: string;
  resourceId?: string;
  resourceType?: string;
  symptoms?: string;
  rangeBegin?: string;
  rangeEnd?: string;
};

type UseHotshotDashboardParams = {
  dashboard: DeployDashboard;
  useHotshot: boolean;
  setDashboardContents: React.Dispatch<React.SetStateAction<DashboardContents>>;
  setLoadingComplete: React.Dispatch<React.SetStateAction<boolean>>;
};

export const useDashboard = ({
  id,
  resourceId,
  resourceType,
  symptoms,
  rangeBegin,
  rangeEnd,
}: UseDashboardParams) => {
  const dispatch = useDispatch();
  const isEphemeral = id === "ephemeral";
  const [useHotshot, setUseHotshot] = useState(isEphemeral);
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

  const { isSuccess: isDashboardLoaded } = useQuery(fetchDashboard({ id }));
  const persistedDashboard = useSelector((s) => selectDashboardById(s, { id }));
  const [dashboard, setDashboard] = useState<DeployDashboard>(persistedDashboard);

  useEffect(() => {
    if (isEphemeral) {
      setDashboard({
        id,
        name: "Ephemeral",
        organizationId: "",
        resourceId: resourceId as string,
        resourceType: resourceType as string,
        rangeBegin: rangeBegin as string,
        rangeEnd: rangeEnd as string,
        symptoms: symptoms as string,
        data: {},
        observationTimestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }, [isEphemeral, id, resourceId, resourceType, rangeBegin, rangeEnd, symptoms]);

  // Update dashboard when persistedDashboard changes
  useEffect(() => {
    if (!isEphemeral && persistedDashboard) {
      setDashboard(persistedDashboard);
    }
  }, [persistedDashboard, isEphemeral]);

  useEffect(() => {
    if (isDashboardLoaded && dashboard) {
      if (Object.entries(dashboard.data).length > 0) {
        // If we have saved content from the backend, use it
        setDashboardContents(dashboard.data as DashboardContents);
        setLoadingComplete(true);
      } else {
        // Otherwise, get data from Hotshot
        setUseHotshot(true);
      }
    }
  }, [isDashboardLoaded, dashboard]);

  useHotshotDashboard({
    dashboard,
    useHotshot,
    setDashboardContents,
    setLoadingComplete,
  });

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

  // useEffect(() => {
  //   if (event) {
  //     setDashboardContents((prevDashboard) =>
  //       handleDashboardEvent(prevDashboard, event),
  //     );
  //   }
  // }, [JSON.stringify(event)]);

  useEffect(() => {
    if (wsReadyState === ReadyState.CLOSED) {
      setLoadingComplete(true);
    }
  }, [wsReadyState]);
};
