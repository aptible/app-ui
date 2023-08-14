import { EnvironmentDetailLayout } from "../layouts";
import { EnvironmentSelect, SelectOption } from "../shared";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

export const CreateLogDrainPage = () => {
  const [params] = useSearchParams();
  const queryEnvId = params.get("environment_id") || "";
  const [envId, setEnvId] = useState(queryEnvId);
  console.log(envId);

  const onEnvSelect = (opt: SelectOption) => {
    setEnvId(opt.value);
  };
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <EnvironmentDetailLayout>
      <div className="flex flex-col gap-4">
        <div>Log drains helper text ...</div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <EnvironmentSelect onSelect={onEnvSelect} />
        </form>
      </div>
    </EnvironmentDetailLayout>
  );
};
