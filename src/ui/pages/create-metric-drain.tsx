import {
  type CreateMetricDrainProps,
  type MetricDrainType,
  datadogSites,
  fetchDatabasesByEnvId,
  provisionMetricDrain,
  selectEnvironmentById,
} from "@app/deploy";
import {
  useDispatch,
  useLoader,
  useLoaderSuccess,
  useQuery,
  useSelector,
} from "@app/react";
import { operationDetailUrl } from "@app/routes";
import { handleValidator, portValidator } from "@app/validator";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useValidator } from "../hooks";
import { EnvironmentDetailLayout } from "../layouts";
import {
  BannerMessages,
  Box,
  ButtonOps,
  DbSelector,
  EnvironmentSelect,
  ExternalLink,
  FormGroup,
  Input,
  Radio,
  RadioGroup,
  Select,
  type SelectOption,
} from "../shared";

const options: SelectOption<MetricDrainType>[] = [
  { value: "influxdb_database", label: "InfluxDb (this environment)" },
  { value: "influxdb", label: "InfluxDb v1 (anywhere)" },
  { value: "influxdb2", label: "InfluxDb v2 (anywhere)" },
  { value: "datadog", label: "Datadog" },
];

const datadogSiteOptions: SelectOption[] = Object.keys(datadogSites).map(
  (site) => ({ label: site, value: site }),
);

const validators = {
  // all
  handle: (p: CreateMetricDrainProps) => {
    return handleValidator(p.handle);
  },
  // influxdb && influxdb2
  hostname: (p: CreateMetricDrainProps) => {
    if (p.drainType !== "influxdb" && p.drainType !== "influxdb2") return;
    if (p.hostname === "") return "Must provide hostname";
    if (p.hostname.startsWith("http"))
      return "Do not include the protocol (e.g. http(s)://)";
  },
  port: (p: CreateMetricDrainProps) => {
    if (p.drainType !== "influxdb" && p.drainType !== "influxdb2") return;
    return portValidator(p.port);
  },
  // influxdb
  username: (p: CreateMetricDrainProps) => {
    if (p.drainType !== "influxdb") return;
    if (p.username === "") return "Must provide username";
  },
  password: (p: CreateMetricDrainProps) => {
    if (p.drainType !== "influxdb") return;
    if (p.password === "") return "Must provide password";
  },
  database: (p: CreateMetricDrainProps) => {
    if (p.drainType !== "influxdb") return;
    if (p.database === "") return "Must provide a database name";
  },
  // influxdb2
  org: (p: CreateMetricDrainProps) => {
    if (p.drainType !== "influxdb2") return;
    if (p.org === "") return "Must provide an organization name";
  },
  authToken: (p: CreateMetricDrainProps) => {
    if (p.drainType !== "influxdb2") return;
    if (p.authToken === "") return "Must provide an API token";
  },
  bucket: (p: CreateMetricDrainProps) => {
    if (p.drainType !== "influxdb2") return;
    if (p.bucket === "") return "Must provide a bucket name";
  },
  // influxdb_database
  dbId: (p: CreateMetricDrainProps) => {
    if (p.drainType !== "influxdb_database") return;
    if (p.dbId === "") return "Must provide an Aptible database";
  },
  // datadog
  apiKey: (p: CreateMetricDrainProps) => {
    if (p.drainType !== "datadog") return;
    if (p.apiKey === "") return "Must provide a Datadog API key";
  },
};

export const CreateMetricDrainPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [params] = useSearchParams();
  const queryEnvId = params.get("environment_id") || "";
  const [envId, setEnvId] = useState(queryEnvId);
  useQuery(fetchDatabasesByEnvId({ envId }));
  const env = useSelector((s) => selectEnvironmentById(s, { id: envId }));
  const [dbId, setDbId] = useState("");
  const [handle, setHandle] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [ddSite, setDdSite] = useState("US1");
  const [protocol, setProtocol] = useState<"http" | "https">("https");
  const [hostname, setHostname] = useState("");
  const [port, setPort] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [database, setDb] = useState("");
  const [org, setOrg] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [bucket, setBucket] = useState("");

  const [drainType, setDrainType] = useState<MetricDrainType>(options[0].value);

  const [errors, validate] = useValidator<
    CreateMetricDrainProps,
    typeof validators
  >(validators);

  const onTypeSelect = (opt: SelectOption<MetricDrainType>) => {
    setDrainType(opt.value);
  };
  const onEnvSelect = (opt: SelectOption) => {
    setEnvId(opt.value);
  };
  const createData = (): CreateMetricDrainProps => {
    const def = {
      envId,
      handle,
    };

    if (drainType === "influxdb_database") {
      return {
        ...def,
        drainType: "influxdb_database",
        dbId,
      };
    }

    if (drainType === "datadog") {
      return {
        ...def,
        drainType: "datadog",
        apiKey,
        ddSite,
      };
    }

    if (drainType === "influxdb2") {
      return {
        ...def,
        drainType: "influxdb2",
        protocol,
        hostname,
        port,
        org,
        authToken,
        bucket,
      };
    }

    return {
      ...def,
      drainType: "influxdb",
      protocol,
      hostname,
      port,
      username,
      password,
      database,
    };
  };

  const data = createData();
  const action = provisionMetricDrain(data);
  const loader = useLoader(action);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate(data)) return;
    dispatch(action);
  };
  const onDbSelect = (opt: SelectOption) => {
    setDbId(opt.value);
  };
  useLoaderSuccess(loader, () => {
    navigate(operationDetailUrl(loader.meta.opId));
  });

  return (
    <EnvironmentDetailLayout>
      <Box>
        <h1 className="text-lg text-black font-semibold">
          Create Metric Drain
        </h1>

        <div className="py-4">
          Metric Drains let you collect metrics from apps and databases deployed
          in the <strong>{env.handle}</strong> environment and route them to a
          metrics destination.
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

          <FormGroup label="Type" htmlFor="metric-type">
            <Select
              ariaLabel="Type"
              id="metric-type"
              options={options}
              onSelect={onTypeSelect}
              value={drainType}
            />
          </FormGroup>

          {drainType === "influxdb_database" ? (
            <FormGroup
              label="InfluxDB"
              htmlFor="db-selector"
              description={
                <p>
                  Only InfluxDB Databases in the {env.handle} Environment are
                  eligible. To use an InfluxDB Database located in another
                  Environment, or hosted with a third party, use the "InfluxDB
                  (anywhere)" option.
                </p>
              }
              feedbackMessage={errors.dbId}
              feedbackVariant={errors.dbId ? "danger" : "info"}
            >
              <DbSelector
                id="db-selector"
                envId={envId}
                onSelect={onDbSelect}
                dbTypeFilters={["influxdb", "influxdb2"]}
                value={dbId}
              />
            </FormGroup>
          ) : null}

          {drainType === "datadog" ? (
            <>
              <FormGroup
                label="API Key"
                htmlFor="api-key"
                description={
                  <div>
                    <p>
                      Create a new API Key in Datadog under{" "}
                      <ExternalLink
                        variant="info"
                        href="https://app.datadoghq.com/account/settings#api"
                      >
                        Integrations / APIs
                      </ExternalLink>{" "}
                      (or reuse an existing one) and paste it here.
                    </p>
                  </div>
                }
                feedbackMessage={errors.apiKey}
                feedbackVariant={errors.apiKey ? "danger" : "info"}
              >
                <Input
                  type="text"
                  id="api-key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.currentTarget.value)}
                />
              </FormGroup>

              <FormGroup
                label="Datadog Site"
                htmlFor="dd-site"
                description="Select the Datadog Site to use."
              >
                <Select
                  ariaLabel="Datadog Site"
                  id="dd-site"
                  options={datadogSiteOptions}
                  onSelect={(opt) => setDdSite(opt.value)}
                />
              </FormGroup>
            </>
          ) : null}

          {drainType === "influxdb" || drainType === "influxdb2" ? (
            <>
              <FormGroup label="Protocol" htmlFor="protocol">
                <RadioGroup
                  name="protocol"
                  selected={protocol}
                  onSelect={setProtocol}
                >
                  <Radio value="https">HTTPS</Radio>
                  <Radio value="http">HTTP</Radio>
                </RadioGroup>
              </FormGroup>

              <FormGroup
                label="Hostname"
                htmlFor="hostname"
                feedbackMessage={errors.hostname}
                feedbackVariant={errors.hostname ? "danger" : "info"}
              >
                <Input
                  type="text"
                  id="hostname"
                  value={hostname}
                  onChange={(e) => setHostname(e.currentTarget.value)}
                />
              </FormGroup>

              <FormGroup
                label="Port"
                htmlFor="port"
                description={
                  "Leave empty to use the default for the protocol (443 for HTTPS, 80 for HTTP)."
                }
                feedbackMessage={errors.port}
                feedbackVariant={errors.port ? "danger" : "info"}
              >
                <Input
                  type="number"
                  id="port"
                  value={port}
                  onChange={(e) => setPort(e.currentTarget.value)}
                />
              </FormGroup>

              {drainType === "influxdb" ? (
                <>
                  <FormGroup
                    label="Username"
                    htmlFor="username"
                    feedbackMessage={errors.username}
                    feedbackVariant={errors.username ? "danger" : "info"}
                  >
                    <Input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.currentTarget.value)}
                    />
                  </FormGroup>

                  <FormGroup
                    label="Password"
                    htmlFor="password"
                    feedbackMessage={errors.password}
                    feedbackVariant={errors.password ? "danger" : "info"}
                  >
                    <Input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.currentTarget.value)}
                    />
                  </FormGroup>

                  <FormGroup
                    label="Database"
                    htmlFor="database"
                    feedbackMessage={errors.database}
                    feedbackVariant={errors.database ? "danger" : "info"}
                  >
                    <Input
                      type="text"
                      id="database"
                      value={database}
                      onChange={(e) => setDb(e.currentTarget.value)}
                    />
                  </FormGroup>
                </>
              ) : null}

              {drainType === "influxdb2" ? (
                <>
                  <FormGroup
                    label="InfluxDB Organization Name"
                    htmlFor="org"
                    feedbackMessage={errors.org}
                    feedbackVariant={errors.org ? "danger" : "info"}
                  >
                    <Input
                      type="text"
                      id="org"
                      value={org}
                      onChange={(e) => setOrg(e.currentTarget.value)}
                    />
                  </FormGroup>

                  <FormGroup
                    label="API Token"
                    htmlFor="authToken"
                    feedbackMessage={errors.authToken}
                    feedbackVariant={errors.authToken ? "danger" : "info"}
                  >
                    <Input
                      type="password"
                      id="authToken"
                      value={authToken}
                      onChange={(e) => setAuthToken(e.currentTarget.value)}
                    />
                  </FormGroup>

                  <FormGroup
                    label="Bucket"
                    htmlFor="bucket"
                    feedbackMessage={errors.bucket}
                    feedbackVariant={errors.bucket ? "danger" : "info"}
                  >
                    <Input
                      type="text"
                      id="bucket"
                      value={bucket}
                      onChange={(e) => setBucket(e.currentTarget.value)}
                    />
                  </FormGroup>
                </>
              ) : null}
            </>
          ) : null}

          <BannerMessages {...loader} />

          <ButtonOps
            className="w-[200px]"
            envId={envId}
            type="submit"
            isLoading={loader.isLoading}
          >
            Save Metric Drain
          </ButtonOps>
        </form>
      </Box>
    </EnvironmentDetailLayout>
  );
};
