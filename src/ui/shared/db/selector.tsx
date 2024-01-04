import {
  selectDatabasesByEnvId,
  selectDatabasesByEnvIdAndType,
} from "@app/deploy";
import { useSelector } from "@app/react";
import { Select, SelectOption } from "../select";

export const DbSelector = ({
  envId,
  onSelect,
  value,
  id,
  ariaLabel = "db-selector",
  className = "",
  dbTypeFilters = [],
}: {
  envId: string;
  onSelect: (opt: SelectOption) => void;
  value?: string;
  ariaLabel?: string;
  id?: string;
  className?: string;
  dbTypeFilters?: string[];
}) => {
  const dbs = useSelector((s) =>
    dbTypeFilters.length > 0
      ? selectDatabasesByEnvIdAndType(s, { envId, types: dbTypeFilters })
      : selectDatabasesByEnvId(s, { envId }),
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
