import { useValidator } from "../hooks";
import { EnvironmentDetailLayout } from "../layouts";
import {
  BannerMessages,
  ButtonCreate,
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
import { CreateLogDrainProps, LogDrainType, provisionLogDrain } from "@app/deploy";
import { handleValidator } from "@app/validator";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLoader } from "saga-query/react";

const validators = {
  // all
  handle: (p: CreateLogDrainProps) => {
    return handleValidator(p.handle);
  },
  dbId: (p: CreateLogDrainProps) => {
    if (p.drainType !== "elasticsearch_database") return;
    if (p.dbId === "") return "Must provide an Aptible database";
  },
};

const options: SelectOption<LogDrainType>[] = [
  { value: "datadog", label: "Datadog" },
  { value: "logdna", label: "Log DNA"},
  { value: "papertrail", label: "Papertrail"},
  { value: "elasticsearch_database", label: "Self-hosted Elasticsearch"},
  { value: "sumologic", label: "Sumo Logic"},
  { value: "https_post", label: "Insight Ops"},
  { value: "manual", label: "Manual Configuration"},
];
export const CreateLogDrainPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [params] = useSearchParams();
  const queryEnvId = params.get("environment_id") || "";
  const [dbId, setDbId] = useState("");
  const [envId, setEnvId] = useState(queryEnvId);
  const [handle, setHandle] = useState("");
  const [drainType, setDrainType] = useState<LogDrainType>(options[0].value);
  const [errors, validate] = useValidator<
    CreateLogDrainProps,
    typeof validators
  >(validators);
  const createData = (): CreateLogDrainProps => {
    const def = {
      envId,
      handle,
    };

    return {
      ...def,
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

  return (
    <EnvironmentDetailLayout>
      <div className="flex flex-col gap-4">
        <h1 className="text-lg text-black font-semibold">Create Log Drain</h1>

        <div>
          Log Drains let you collect stdout and stderr logs from your apps and
          databases deployed in the sbx-madhu environment and route them to a
          log destination.
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="text-md font-semibold text-gray-900 block -mb-3">
            Environment
          </div>
          <EnvironmentSelect onSelect={onEnvSelect} />

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

          {drainType === "datadog" ? (<FormGroup label="Datadog" description={<p>Finish configuring your Datadog Log Drain.</p>}></FormGroup>) : null}

          {drainType === "logdna" ? (<FormGroup label="Datadog" description={<p>Finish configuring your Datadog Log Drain.</p>}></FormGroup>) : null}

          {drainType === "papertrail" ? (<FormGroup label="Datadog" description={<p>Finish configuring your Datadog Log Drain.</p>}></FormGroup>) : null}

          {drainType === "elasticsearch_database" ? (
            <FormGroup
              label="Elasticsearch Database"
              htmlFor="db-selector"
              description={
                <p>
                  Finish configuring your Elasticsearch Log Drain.
                </p>
              }
              feedbackMessage={errors.dbId}
              feedbackVariant={errors.dbId ? "danger" : "info"}
            >
              <DbSelector
                id="db-selector"
                envId={envId}
                onSelect={onDbSelect}
                value={dbId}
              />
            </FormGroup>
          ) : null}

          {drainType === "sumologic" ? (<FormGroup label="Datadog" description={<p>Finish configuring your Datadog Log Drain.</p>}></FormGroup>) : null}

          {drainType === "https_post" ? (<FormGroup label="Datadog" description={<p>Finish configuring your Datadog Log Drain.</p>}></FormGroup>) : null}

          {drainType === "manual" ? (<FormGroup label="Datadog" description={<p>Finish configuring your Datadog Log Drain.</p>}></FormGroup>) : null}

          <BannerMessages {...loader} />

          <ButtonCreate
            className="w-[200px]"
            envId={envId}
            type="submit"
            isLoading={loader.isLoading}
          >
            Save LogDrain
          </ButtonCreate>
        </form>
      </div>
    </EnvironmentDetailLayout>
  );
};
