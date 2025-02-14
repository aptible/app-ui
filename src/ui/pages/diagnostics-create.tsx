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
  Select,
  Tooltip,
} from "../shared";
import { AppSelect } from "../shared/select-apps";
import { createDashboard } from "@app/deploy/dashboard";
import { useDispatch, useLoader, useSelector } from "@app/react";
import { selectOrganizationSelectedId } from "@app/organizations";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";

export const DiagnosticsCreateForm = ({ appId }: { appId: string }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const symptomOptions = [
    { label: "App is slow", value: "App is slow" },
    { label: "App is unavailable", value: "App is unavailable" },
    {
      label: "App is experiencing high error rate",
      value: "App is experiencing high error rate",
    },
  ];
  const [symptoms, setSymptom] = useState(symptomOptions[0].value);

  // We need to memoize the now date because the date picker will re-render the
  // component when the date changes, making the timestamps in the options
  // invalid.
  const now = useMemo(
    () => DateTime.now().minus({ minutes: DateTime.local().offset }),
    [],
  );

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
      appId !== "" &&
      startDate !== null &&
      endDate !== null &&
      startDate < endDate,
    [symptoms, appId, startDate, endDate],
  );

  // Submit the form.
  const [isLoading, setIsLoading] = useState(false);
  const orgId = useSelector(selectOrganizationSelectedId);
  const action = createDashboard({
    name: `Diagnostics - ${symptoms}`,
    resourceId: appId,
    resourceType: "app",
    organizationId: orgId,
  });
  const loader = useLoader(action);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await loader;
      dispatch(action);
      console.log("Dashboard response:", response);

      // Then navigate to the details page
      // navigate(
      //   diagnosticsDetailUrl(
      //     appId,
      //     symptoms,
      //     startDate.toUTC(0, { keepLocalTime: true }).toJSDate(),
      //     endDate.toUTC(0, { keepLocalTime: true }).toJSDate(),
      //   ),
      // );
    } catch (error) {
      console.error("Failed to create dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
          <Select
            onSelect={(o) => setSymptom(o.value)}
            value={symptoms}
            options={symptomOptions}
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
            <div className="flex gap-1 flex-col">
              <div className="block">&nbsp;</div>
              <div className="text-gray-500">UTC</div>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <hr />
          <div className="flex justify-between items-end gap-2">
            <div className="flex items-center gap-2 mt-4">
              {(!isValid && (
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
      </form>
    </>
  );
};

export const DiagnosticsCreatePage = () => {
  const [envId, setEnvId] = useState("");
  const [appId, setAppId] = useState("");

  // If the envId changes, the appId should be reset to an empty string
  useEffect(() => {
    setAppId("");
  }, [envId]);

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
        <h1 className="text-lg text-gray-500 mb-4">Choose App to Diagnose</h1>
        <FormGroup
          label="Environment"
          htmlFor="Environment"
          feedbackVariant="info"
          className="mb-4"
        >
          <EnvironmentSelect
            onSelect={(o) => setEnvId(o.value)}
            value={envId}
          />
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
        <DiagnosticsCreateForm appId={appId} />
      </Box>
    </AppSidebarLayout>
  );
};
