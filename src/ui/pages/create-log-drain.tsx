import {
  type CreateLogDrainProps,
  provisionLogDrain,
  selectEnvironmentById,
} from "@app/deploy";
import {
  useDispatch,
  useLoader,
  useLoaderSuccess,
  useSelector,
} from "@app/react";
import { operationDetailUrl } from "@app/routes";
import type { LogDrainType } from "@app/types";
import { handleValidator, portValidator } from "@app/validator";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useValidator } from "../hooks";
import { EnvironmentDetailLayout } from "../layouts";
import {
  Banner,
  BannerMessages,
  Box,
  ButtonOps,
  CheckBox,
  Code,
  DbSelector,
  EnvironmentSelect,
  ExternalLink,
  FormGroup,
  Input,
  Label,
  Select,
  type SelectOption,
} from "../shared";

const DrainTypeNotice = ({
  drainType,
  allowPhi,
  envHandle,
}: { drainType: LogDrainType; allowPhi: boolean; envHandle: string }) => {
  if (drainType === "logdna") {
    return <Banner variant="info">Signs BAAs</Banner>;
  }

  if (drainType === "papertrail") {
    return <Banner variant="info">Signs BAAs</Banner>;
  }

  if (drainType === "sumologic") {
    return <Banner variant="info">Signs BAAs</Banner>;
  }

  if (drainType === "insightops") {
    return <Banner variant="info">Signs BAAs</Banner>;
  }

  if (drainType === "datadog") {
    return <Banner variant="info">Signs BAAs</Banner>;
  }

  if (drainType === "elasticsearch_database") {
    if (allowPhi) {
      return <Banner variant="info">{envHandle} is safe for PHI</Banner>;
    }
    return <Banner variant="warning">{envHandle} is not safe for PHI</Banner>;
  }

  return null;
};

const validators = {
  // all
  handle: (p: CreateLogDrainProps) => {
    return handleValidator(p.handle);
  },
  dbId: (p: CreateLogDrainProps) => {
    if (p.drainType !== "elasticsearch_database") return;
    if (p.databaseId === "") return "Must provide an Aptible database";
  },
  // papertrail, syslog_tls_tcp
  drainHost: (p: CreateLogDrainProps) => {
    if (!(p.drainType === "syslog_tls_tcp" || p.drainType === "papertrail"))
      return;
    if (p.drainHost === "") return "Must provide a Drain Host";
  },
  drainPort: (p: CreateLogDrainProps) => {
    if (!(p.drainType === "syslog_tls_tcp" || p.drainType === "papertrail"))
      return;
    return portValidator(p.drainPort);
  },
  // datadog, logdna, sumologic, https_post
  url: (p: CreateLogDrainProps) => {
    if (
      !(
        p.drainType === "datadog" ||
        p.drainType === "sumologic" ||
        p.drainType === "https_post" ||
        p.drainType === "logdna"
      )
    )
      return;
    if (p.url === "") return "Must provide a URL for log drain";
    if (!p.url.startsWith("https")) return "Must begin with https://";
  }
};

const options: SelectOption<LogDrainType>[] = [
  { value: "datadog", label: "Datadog" },
  { value: "logdna", label: "Mezmo (formerly LogDNA)" },
  { value: "papertrail", label: "Papertrail" },
  { value: "sumologic", label: "Sumo Logic" },
  { value: "insightops", label: "InsightOps" },
  { value: "elasticsearch_database", label: "Self-hosted Elasticsearch" },
  { value: "https_post", label: "HTTPS POST" },
  { value: "syslog_tls_tcp", label: "Syslog TLS TCP" },
];
export const CreateLogDrainPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [params] = useSearchParams();
  const queryEnvId = params.get("environment_id") || "";
  const [dbId, setDbId] = useState("");
  const [envId, setEnvId] = useState(queryEnvId);
  const env = useSelector((s) => selectEnvironmentById(s, { id: envId }));
  const [handle, setHandle] = useState("");
  const [drainApps, setDrainApps] = useState(true);
  const [drainDatabases, setDrainDatabases] = useState(true);
  const [drainEphemeralSessions, setDrainEphemeralSessions] = useState(true);
  const [drainProxies, setDrainProxies] = useState(false);
  const [drainHost, setDrainHost] = useState("");
  const [drainPort, setDrainPort] = useState("");
  const [loggingToken, setLoggingToken] = useState("");
  const [url, setUrl] = useState("");
  const [drainType, setDrainType] = useState<LogDrainType>(options[0].value);
  const [errors, validate] = useValidator<
    CreateLogDrainProps,
    typeof validators
  >(validators);
  const createData = (): CreateLogDrainProps => {
    const def = {
      envId,
      handle,
      drainApps,
      drainDatabases,
      drainEphemeralSessions,
      drainProxies,
    };

    if (drainType === "elasticsearch_database") {
      return {
        ...def,
        drainType,
        databaseId: dbId,
      };
    }

    if (drainType === "papertrail") {
      return {
        ...def,
        drainType,
        drainHost,
        drainPort,
      };
    }

    if (
      drainType === "datadog" ||
      drainType === "logdna" ||
      drainType === "sumologic" ||
      drainType === "https_post"
    ) {
      return {
        ...def,
        drainType,
        url,
      };
    }

    if (drainType === "insightops") {
      return {
        ...def,
        drainType,
        loggingToken,
      };
    }

    return {
      ...def,
      drainType: "syslog_tls_tcp",
      drainHost,
      drainPort,
      loggingToken,
    };
  };

  const data = createData();
  const action = provisionLogDrain(data);
  const loader = useLoader(action);
  const onTypeSelect = (opt: SelectOption<LogDrainType>) => {
    setDrainType(opt.value);
  };
  const onDbSelect = (opt: SelectOption) => {
    setDbId(opt.value);
  };
  const onEnvSelect = (opt: SelectOption) => {
    setEnvId(opt.value);
  };
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate(data)) return;
    dispatch(action);
  };
  useLoaderSuccess(loader, () => {
    navigate(operationDetailUrl(loader.meta.opId));
  });

  return (
    <EnvironmentDetailLayout>
      <Box>
        <h1 className="text-lg text-black font-semibold">Create Log Drain</h1>

        <div className="py-4">
          Log Drains let you collect stdout and stderr logs from your apps and
          databases deployed in the <strong>{env.handle}</strong> environment
          and route them to a log destination.
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="text-md font-semibold text-gray-900 block -mb-3">
            Environment
          </div>
          <EnvironmentSelect value={envId} onSelect={onEnvSelect} />

          <FormGroup
            label="Handle"
            htmlFor="handle"
            feedbackMessage={errors.handle}
            feedbackVariant={errors.handle ? "danger" : "info"}
          >
            <Input
              type="text"
              id="handle"
              value={handle}
              onChange={(e) => setHandle(e.currentTarget.value)}
            />
          </FormGroup>

          <FormGroup label="Type" htmlFor="drain-type">
            <Select
              ariaLabel="Type"
              id="drain-type"
              options={options}
              onSelect={onTypeSelect}
              value={drainType}
            />
          </FormGroup>

          <DrainTypeNotice
            drainType={drainType}
            allowPhi={env.type === "production"}
            envHandle={env.handle}
          />

          <div className="flex flex-col">
            <Label>Sources</Label>
            <p className="text-gray-500">
              Select which logs should be captured:
            </p>
          </div>
          <CheckBox
            label="App Logs"
            name="app-logs"
            checked={drainApps}
            onChange={(e) => setDrainApps(e.currentTarget.checked)}
          />
          <CheckBox
            label="Database Logs"
            name="db-logs"
            checked={drainDatabases}
            onChange={(e) => setDrainDatabases(e.currentTarget.checked)}
          />
          <CheckBox
            label="SSH Session Logs"
            name="ssh-logs"
            checked={drainEphemeralSessions}
            onChange={(e) => setDrainEphemeralSessions(e.currentTarget.checked)}
          />
          <CheckBox
            label="Endpoint Logs"
            name="endpoint-logs"
            checked={drainProxies}
            onChange={(e) => setDrainProxies(e.currentTarget.checked)}
          />

          {drainType === "papertrail" || drainType === "syslog_tls_tcp" ? (
            <FormGroup
              label="Host"
              description={
                drainType === "papertrail" ? (
                  <p>
                    Host Add a new Log Destination in Papertrail (make sure to
                    accept TCP + TLS connections and logs from unrecognized
                    senders), then copy the host from the Log Destination.
                  </p>
                ) : undefined
              }
              htmlFor="host"
              feedbackMessage={errors.drainHost}
              feedbackVariant={errors.drainHost ? "danger" : "info"}
            >
              <Input
                type="text"
                id="host"
                name="host"
                value={drainHost}
                onChange={(e) => setDrainHost(e.currentTarget.value)}
              />
            </FormGroup>
          ) : null}

          {drainType === "papertrail" || drainType === "syslog_tls_tcp" ? (
            <FormGroup
              label="Port"
              description={
                <p>Add the port from the Log Destination you added.</p>
              }
              htmlFor="port"
              feedbackMessage={errors.drainPort}
              feedbackVariant={errors.drainPort ? "danger" : "info"}
            >
              <Input
                type="number"
                id="port"
                value={drainPort}
                onChange={(e) => setDrainPort(e.currentTarget.value)}
              />
            </FormGroup>
          ) : null}

          {drainType === "elasticsearch_database" ? (
            <FormGroup
              label="Elasticsearch Database"
              htmlFor="db-selector"
              description={
                <p>Finish configuring your Elasticsearch Log Drain.</p>
              }
              feedbackMessage={errors.dbId}
              feedbackVariant={errors.dbId ? "danger" : "info"}
            >
              <Banner className="mb-2" variant="warning">
                Logs from this Elasticsearch database will <strong>not</strong>{" "}
                be captured by the Log Drain to avoid creating a feedback loop.
              </Banner>
              <DbSelector
                id="db-selector"
                envId={envId}
                onSelect={onDbSelect}
                dbTypeFilters={["elasticsearch"]}
                value={dbId}
              />
            </FormGroup>
          ) : null}

          {drainType === "sumologic" ||
          drainType === "datadog" ||
          drainType === "logdna" ||
          drainType === "https_post" ? (
            <FormGroup
              label="URL"
              description={
                <>
                  {drainType === "https_post" && <p>Must be a HTTPS URL.</p>}
                  {drainType === "datadog" && (
                    <p>
                      For Datadog Site US1, this must be in the format of{" "}
                      <Code>
                        https://http-intake.logs.datadoghq.com/v1/input/DD_API_KEY
                      </Code>
                      . For other sites and more options, refer to{" "}
                      <ExternalLink
                        variant="success"
                        href="https://docs.datadoghq.com/logs/"
                      >
                        https://docs.datadoghq.com/logs/log_collection
                      </ExternalLink>
                      .
                    </p>
                  )}
                  {drainType === "logdna" && (
                    <p>
                      Must be in the format of{" "}
                      <Code>
                        https://logs.mezmo.com/aptible/ingest/INGESTION KEY
                      </Code>
                      . Refer to{" "}
                      <ExternalLink
                        variant="success"
                        href="https://docs.mezmo.com/docs/aptible-logs"
                      >
                        https://docs.mezmo.com/docs/aptible-logs
                      </ExternalLink>
                      .
                    </p>
                  )}
                  {drainType === "sumologic" && (
                    <p>
                      Create a new Hosted Collector in Sumologic using a HTTP
                      source, then copy the HTTP Source Address.
                    </p>
                  )}
                </>
              }
              htmlFor="url"
              feedbackMessage={errors.url}
              feedbackVariant={errors.url ? "danger" : "info"}
            >
              <Input
                type="text"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.currentTarget.value)}
              />
            </FormGroup>
          ) : null}

          {drainType === "insightops" || drainType === "syslog_tls_tcp" ? (
            <FormGroup
              label="Token"
              description={
                <>
                  {drainType === "insightops" && (
                    <p>
                      Add a new Token TCP Log in InsightOps, then copy the
                      Logging Token provided by InsightOps.
                    </p>
                  )}
                  {drainType === "syslog_tls_tcp" && (
                    <p>
                      All log lines sent through this Log Drain will be prefixed
                      with this token
                    </p>
                  )}
                </>
              }
              htmlFor="logging-token"
              feedbackMessage={errors.loggingToken}
              feedbackVariant={errors.loggingToken ? "danger" : "info"}
            >
              <Input
                type="text"
                id="logging-token"
                value={loggingToken}
                onChange={(e) => setLoggingToken(e.currentTarget.value)}
              />
            </FormGroup>
          ) : null}

          <BannerMessages {...loader} />

          <ButtonOps
            className="w-[200px]"
            envId={envId}
            type="submit"
            isLoading={loader.isLoading}
          >
            Save Log Drain
          </ButtonOps>
        </form>
      </Box>
    </EnvironmentDetailLayout>
  );
};
