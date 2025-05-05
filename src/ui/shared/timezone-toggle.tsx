import { useEffect, useState } from "react";
import { FormGroup } from "./form-group";
import { Select } from "./select";
import type { SelectOption } from "./select";
import type { TimezoneMode } from "./timezone-context";
import { getLimitedTimezoneOptions, getTimezoneOptions } from "./timezones";

interface TimezoneToggleProps {
  value: TimezoneMode;
  onChange: (value: TimezoneMode) => void;
  className?: string;
  label?: string;
  showFullList?: boolean;
  limitedOptions?: boolean;
}

export const TimezoneToggle = ({
  value,
  onChange,
  className = "",
  label = "Timezone",
  showFullList = false,
  limitedOptions = false,
}: TimezoneToggleProps) => {
  const [options, setOptions] = useState<SelectOption[]>([
    { label: "Local", value: "local", key: "local" },
    { label: "UTC", value: "utc", key: "utc" },
  ]);

  useEffect(() => {
    if (limitedOptions) {
      // Only show local timezone and UTC options
      setOptions(getLimitedTimezoneOptions());
    } else if (showFullList) {
      // Show all timezones
      const timezoneOptions = getTimezoneOptions();
      setOptions([
        { label: "Local", value: "local", key: "local" },
        { label: "UTC", value: "utc", key: "utc" },
        ...timezoneOptions,
      ]);
    }
  }, [showFullList, limitedOptions]);

  return (
    <FormGroup label={label} htmlFor="timezone-toggle" className={className}>
      <Select
        options={options}
        value={value}
        onSelect={(option) => onChange(option.value as TimezoneMode)}
      />
    </FormGroup>
  );
};
