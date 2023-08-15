import { Select, SelectOption } from "../select";
import { selectDatabasesByEnvId } from "@app/deploy";
import { AppState } from "@app/types";
import { useSelector } from "react-redux";

export const DbSelector = ({
  envId,
  onSelect,
  value,
  id,
  ariaLabel = "db-selector",
  className = "",
}: {
  envId: string;
  onSelect: (opt: SelectOption) => void;
  value?: string;
  ariaLabel?: string;
  id?: string;
  className?: string;
}) => {
  const dbs = useSelector((s: AppState) =>
    selectDatabasesByEnvId(s, { envId }),
  );
  const options = [
    { value: "", label: "Choose a Database" },
    ...dbs.map((d) => ({
      label: `${d.handle} (${d.type})`,
      value: d.id,
    })),
  ];

  return (
    <Select
      id={id}
      ariaLabel={ariaLabel}
      onSelect={onSelect}
      value={value}
      options={options}
      className={className}
    />
  );
};
