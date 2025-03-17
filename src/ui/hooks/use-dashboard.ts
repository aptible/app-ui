import { type DashboardContents, handleDashboardEvent } from "@app/aptible-ai";
import { selectAptibleAiUrl } from "@app/config";
import { updateDashboard } from "@app/deploy/dashboard";
import { fetchDashboard, selectDashboardById } from "@app/deploy/dashboard";
import { useDispatch, useQuery, useSelector } from "@app/react";
import { selectAccessToken } from "@app/token";
import type { DeployDashboard } from "@app/types/deploy";
import { useEffect, useState } from "react";
import { useActionCable, useChannel } from "@app/ui/hooks/use-actioncable";

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

  const { actionCable } = useActionCable(aptibleAiUrl);
  const { subscribe, unsubscribe } = useChannel(actionCable, {
    verbose: true,
  });

  useEffect(() => {
    if (!dashboard.id) {
      return;
    }

    subscribe({
      channel: "HotshotChannel",
      token: accessToken,
      resource_id: dashboard.resourceId,
      symptom_description: dashboard.symptoms,
      start_time: dashboard.rangeBegin,
      end_time: dashboard.rangeEnd,
    }, {
        initialized: () => {
          console.log("initialized");
        },
        connected: () => {
          console.log("connected");
        },
        received: (data: string) => {
          setDashboardContents((prevDashboard) => {
            try {
              return handleDashboardEvent(prevDashboard, JSON.parse(data));
            } catch (error) {
              console.error(error);
              return prevDashboard;
            }
          });
        },
        disconnected: () => {
          setLoadingComplete(true);
        },
      },
    );

    return () => unsubscribe();
  }, [dashboard.id]);
};
