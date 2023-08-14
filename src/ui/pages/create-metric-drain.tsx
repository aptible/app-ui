import { EnvironmentDetailLayout } from "../layouts";
import {
  DbSelector,
  EnvironmentSelect,
  ExternalLink,
  FormGroup,
  Input,
  Radio,
  RadioGroup,
  Select,
  SelectOption,
} from "../shared";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

const options: SelectOption[] = [
  { value: "influxdb-env", label: "InfluxDb (this environment)" },
  { value: "influxdb-any", label: "InfluxDb (anywhere)" },
  { value: "datadog", label: "Datadog" },
];

export const CreateMetricDrainPage = () => {
  const [params] = useSearchParams();
  const queryEnvId = params.get("environment_id") || "";
  const [envId, setEnvId] = useState(queryEnvId);
  const [dbId, setDbId] = useState("");
  const [handle, setHandle] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [protocol, setProtocol] = useState("https");
  const [hostname, setHostname] = useState("");
  const [port, setPort] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [db, setDb] = useState("");

  const [metricType, setMetricType] = useState(options[0].value);

  const onTypeSelect = (opt: SelectOption) => {
    setMetricType(opt.value);
  };
  const onEnvSelect = (opt: SelectOption) => {
    setEnvId(opt.value);
  };
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };
  const onDbSelect = (opt: SelectOption) => {
    setDbId(opt.value);
  };

  return (
    <EnvironmentDetailLayout>
      <div className="flex flex-col gap-4">
        <div>
          Metric Drains let you collect metrics from apps and databases deployed
          in the sbx-main environment and route them to a metrics destination.
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <EnvironmentSelect onSelect={onEnvSelect} />

          <FormGroup label="Handle" htmlFor="handle">
            <Input
              type="text"
              id="handle"
              value={handle}
              onChange={(e) => setHandle(e.currentTarget.value)}
            />
          </FormGroup>

          <FormGroup label="Type" htmlFor="metric-type">
            <Select
              id="metric-type"
              options={options}
              onSelect={onTypeSelect}
              value={metricType}
            />
          </FormGroup>

          {metricType === "influxdb-env" ? (
            <FormGroup
              label="InfluxDB"
              htmlFor="db-selector"
              description={
                <p>
                  Only InfluxDB Databases in the sbx-main Environment are
                  eligible. To use an InfluxDB Database located in another
                  Environment, or hosted with a third party, use the "InfluxDB
                  (anywhere)" option.
                </p>
              }
            >
              <DbSelector
                id="db-selector"
                envId={envId}
                onSelect={onDbSelect}
                value={dbId}
              />
            </FormGroup>
          ) : null}

          {metricType === "datadog" ? (
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
            >
              <Input
                type="text"
                id="api-key"
                value={apiKey}
                onChange={(e) => setApiKey(e.currentTarget.value)}
              />
            </FormGroup>
          ) : null}

          {metricType === "influxdb-any" ? (
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

              <FormGroup label="Hostname" htmlFor="hostname">
                <Input
                  type="text"
                  id="hostname"
                  value={hostname}
                  onChange={(e) => setHostname(e.currentTarget.value)}
                />
              </FormGroup>

              <FormGroup label="Port" htmlFor="port">
                <Input
                  type="number"
                  id="port"
                  value={port}
                  onChange={(e) => setPort(e.currentTarget.value)}
                />
              </FormGroup>

              <FormGroup label="Username" htmlFor="username">
                <Input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.currentTarget.value)}
                />
              </FormGroup>

              <FormGroup label="Password" htmlFor="password">
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                />
              </FormGroup>

              <FormGroup label="Database" htmlFor="database">
                <Input
                  type="text"
                  id="database"
                  value={db}
                  onChange={(e) => setDb(e.currentTarget.value)}
                />
              </FormGroup>
            </>
          ) : null}
        </form>
      </div>
    </EnvironmentDetailLayout>
  );
};
