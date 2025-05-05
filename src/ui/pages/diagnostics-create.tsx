import { createDashboard } from "@app/deploy/dashboard";
import {
  selectHasDiagnosticsPocFeature,
  selectOrganizationSelectedId,
} from "@app/organizations";
import {
  useDispatch,
  useLoader,
  useLoaderSuccess,
  useSelector,
} from "@app/react";
import {
  diagnosticsCreateUrl,
  diagnosticsDetailUrl,
  diagnosticsUrl,
} from "@app/routes";
import { DateTime } from "luxon";
import { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import { AppSidebarLayout } from "../layouts";
import {
  Banner,
  Box,
  Breadcrumbs,
  Button,
  EnvironmentSelect,
  FormGroup,
  Input,
  Select,
  TimezoneToggle,
  Tooltip,
} from "../shared";
import { AppSelect } from "../shared/select-apps";
import "react-datepicker/dist/react-datepicker.css";
import { selectAppById } from "@app/deploy/app";
import {
  selectCustomResourceById,
  selectCustomResourcesAsList,
} from "@app/deploy/custom-resource";
import { selectTokenHasWriteAccess } from "@app/token";
import { useNavigate } from "react-router-dom";
import type { TimezoneMode } from "../shared/timezone-context";

export interface DiagnosticsCreateFormProps {
  resourceId: string;
  resourceType: string;
  resourceName: string;
}

export const DiagnosticsCreateForm = ({
  resourceId,
  resourceType,
  resourceName,
}: DiagnosticsCreateFormProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const resourceTypeLabel = resourceType === "App" ? "App" : "Resource";

  const [symptoms, setSymptom] = useState("");
  const canCreateDiagnostics = useSelector(selectTokenHasWriteAccess);

  const [timezone, setTimezone] = useState<TimezoneMode>("utc");

  // We need to memoize the now date because the date picker will re-render the
  // component when the date changes, making the timestamps in the options
  // invalid. We use the local time now, not UTC.
  const now = useMemo(() => DateTime.now(), []);

  const timePresets = [
    { label: "Last 15 minutes", value: now.minus({ minutes: 15 }).toISO() },
    { label: "Last 30 minutes", value: now.minus({ minutes: 30 }).toISO() },
    { label: "Last 1 hour", value: now.minus({ hours: 1 }).toISO() },
    { label: "Last 3 hours", value: now.minus({ hours: 3 }).toISO() },
    { label: "Last 6 hours", value: now.minus({ hours: 6 }).toISO() },
    { label: "Last 12 hours", value: now.minus({ hours: 12 }).toISO() },
    { label: "Last 24 hours", value: now.minus({ days: 1 }).toISO() },
    { label: "Custom", value: "" },
  ];
  // Default to a 1 hour time window
  const [timePreset, setTimePreset] = useState(timePresets[2].value);

  const [startDate, setStartDate] = useState<DateTime>(
    DateTime.fromISO(timePreset),
  );
  const onSelectStartDate = (date: Date) => {
    const dateTime = DateTime.fromJSDate(date);
    setStartDate(() => {
      // If the start date is greater than the end date, set the end date to the
      // start date plus 15 minutes, or the current timestamp if 15 minutes would
      // put the end date in the future.
      if (dateTime > endDate) {
        const newEndDate = dateTime.plus({ minutes: 15 });
        setEndDate(newEndDate > now ? now : newEndDate);
      }
      return dateTime;
    });
    setTimePreset("");
  };

  const [endDate, setEndDate] = useState<DateTime>(now);
  const onSelectEndDate = (date: Date) => {
    setEndDate(DateTime.fromJSDate(date));
    setTimePreset("");
  };

  // If the time preset is anything but custom, set the end date to now, and the
  // start date to the appropriate value.
  useEffect(() => {
    if (timePreset !== "") {
      setStartDate(DateTime.fromISO(timePreset));
      setEndDate(now);
    }
  }, [timePreset]);

  // Validate the form.
  const isValid = useMemo(
    () =>
      symptoms !== "" &&
      resourceId !== "" &&
      startDate !== null &&
      endDate !== null &&
      startDate < endDate,
    [symptoms, resourceId, startDate, endDate],
  );

  // Submit the form.
  const [isLoading, setIsLoading] = useState(false);
  const orgId = useSelector(selectOrganizationSelectedId);

  const action = createDashboard({
    name: `${resourceName}: ${symptoms}`,
    resourceId: resourceId,
    resourceType: resourceType,
    organizationId: orgId,
    symptoms,
    rangeBegin: startDate.toUTC().toISO() ?? "",
    rangeEnd: endDate.toUTC().toISO() ?? "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canCreateDiagnostics) {
      return;
    }
    setIsLoading(true);

    try {
      dispatch(action);
    } catch (error) {
      console.error("Failed to create dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loader = useLoader(action);
  useLoaderSuccess(loader, () => {
    navigate(diagnosticsDetailUrl(loader.meta.dashboardId));
  });

  const canSubmit = useMemo(() => {
    return canCreateDiagnostics && isValid;
  }, [canCreateDiagnostics, isValid]);

  return (
    <>
      <form onSubmit={handleSubmit}>
        <h1 className="text-lg text-gray-500 mb-4">Issue Description</h1>
        <FormGroup
          label="Symptoms"
          htmlFor="Symptoms"
          feedbackVariant="info"
          className="flex-1 mb-4"
        >
          <Input
            placeholder={`e.g., ${resourceTypeLabel} is slow`}
            value={symptoms}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSymptom(e.target.value)
            }
          />
        </FormGroup>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <FormGroup label="Time Range" htmlFor="Time Range">
              <Select
                onSelect={(o) => setTimePreset(o.value)}
                defaultValue={timePresets[2].value}
                value={timePreset}
                options={timePresets}
              />
            </FormGroup>
          </div>
          <div className="flex items-center gap-2">
            <FormGroup label="Start Time" htmlFor="Start Date">
              <DatePicker
                selected={startDate?.toJSDate()}
                onChange={(date) => onSelectStartDate(date ?? new Date())}
                showTimeSelect
                dateFormat="Pp"
                timeIntervals={15}
                enableTabLoop={false}
                filterDate={(date) => date < now.toJSDate()}
                filterTime={(time) => time < now.toJSDate()}
              />
            </FormGroup>
            <FormGroup label="End Time" htmlFor="End Date">
              <DatePicker
                selected={endDate?.toJSDate()}
                onChange={(date) => onSelectEndDate(date ?? new Date())}
                showTimeSelect
                timeIntervals={15}
                dateFormat="Pp"
                enableTabLoop={false}
                filterDate={(date) => date < now.toJSDate()}
                filterTime={(time) => time < now.toJSDate()}
              />
            </FormGroup>
            <TimezoneToggle
              value={timezone}
              onChange={setTimezone}
              limitedOptions={true}
            />
          </div>
        </div>
        <div className="mt-4">
          <hr />
          <div className="flex justify-between items-end gap-2">
            <div className="flex items-center gap-2 mt-4">
              {(!canSubmit && (
                <Tooltip text="Please fill out all fields and ensure the start date is before the end date.">
                  <Button
                    type="submit"
                    className="w-[200px] flex font-semibold"
                    disabled
                  >
                    Generate Diagnostics
                  </Button>
                </Tooltip>
              )) || (
                <Button
                  type="submit"
                  className="w-[200px] flex font-semibold"
                  isLoading={isLoading}
                >
                  Generate Diagnostics
                </Button>
              )}
              <Button className="w-fit ml-2 flex font-semibold" variant="white">
                Cancel
              </Button>
            </div>
          </div>
        </div>
        {!canCreateDiagnostics && (
          <div className="mt-4">
            <Banner variant="warning">
              You do not have write access to create diagnostics. Please contact
              support if you need to create diagnostics.
            </Banner>
          </div>
        )}
      </form>
    </>
  );
};

export const DiagnosticsCreatePage = () => {
  const hasDiagnosticsPoc = useSelector(selectHasDiagnosticsPocFeature);
  const DiagnosticsCreateForm = hasDiagnosticsPoc
    ? CustomResourceDiagnosticsCreateForm
    : AppDiagnosticsCreateForm;

  return (
    <AppSidebarLayout>
      <Breadcrumbs
        crumbs={[
          {
            name: "Diagnostics",
            to: diagnosticsUrl(),
          },
          {
            name: "New Diagnostics",
            to: diagnosticsCreateUrl(),
          },
        ]}
      />

      <Box>
        <Banner className="mb-6">
          <strong>New Feature:</strong> Use Aptible AI to diagnose production
          issues related to increased errors, latency or availability.
        </Banner>

        <DiagnosticsCreateForm />
      </Box>
    </AppSidebarLayout>
  );
};

export const AppDiagnosticsCreateForm = () => {
  const [envId, setEnvId] = useState("");
  const [appId, setAppId] = useState("");

  const app = useSelector((s) => selectAppById(s, { id: appId }));

  // If the envId changes, the appId should be reset to an empty string
  useEffect(() => {
    setAppId("");
  }, [envId]);

  return (
    <>
      <h1 className="text-lg text-gray-500 mb-4">Choose App to Diagnose</h1>
      <FormGroup
        label="Environment"
        htmlFor="Environment"
        feedbackVariant="info"
        className="mb-4"
      >
        <EnvironmentSelect onSelect={(o) => setEnvId(o.value)} value={envId} />
      </FormGroup>
      <FormGroup
        label="App"
        htmlFor="App"
        feedbackVariant="info"
        className="mb-4"
      >
        <AppSelect
          envId={envId}
          onSelect={(o) => setAppId(o.value)}
          value={appId}
          disabled={!envId}
        />
      </FormGroup>
      <DiagnosticsCreateForm
        resourceId={appId}
        resourceType="App"
        resourceName={app.handle}
      />
    </>
  );
};

export const CustomResourceDiagnosticsCreateForm = () => {
  const [resourceId, setResourceId] = useState("");
  const resources = useSelector((s) => selectCustomResourcesAsList(s));
  const resource = useSelector((s) =>
    selectCustomResourceById(s, { id: resourceId }),
  );
  const resourceOptions = useMemo(() => {
    return resources
      .map((r) => ({ label: `${r.resourceType} / ${r.handle}`, value: r.id }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [resources]);

  useEffect(() => {
    if (resourceOptions.length > 0) {
      setResourceId(resourceOptions[0].value);
    }
  }, [resourceOptions]);

  return (
    <>
      <h1 className="text-lg text-gray-500 mb-4">
        Choose Resource to Diagnose
      </h1>
      <FormGroup
        label="Resource"
        htmlFor="Resource"
        feedbackVariant="info"
        className="mb-4"
      >
        <Select
          options={resourceOptions}
          onSelect={(o) => setResourceId(o.value)}
          value={resourceId}
        />
      </FormGroup>
      <DiagnosticsCreateForm
        resourceId={resourceId}
        resourceType="CustomResource"
        resourceName={resource.handle}
      />
    </>
  );
};
