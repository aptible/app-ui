export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  options: SelectOption[];
  defaultValue?: SelectOption;
  value?: SelectOption;
  onSelect: (s: SelectOption) => void;
}

export function Select({
  value,
  options,
  onSelect,
  defaultValue,
}: SelectProps) {
  return (
    <select
      name="stack"
      value={value?.value}
      defaultValue={defaultValue?.value}
      onChange={(e) => {
        const value = e.currentTarget.value;
        const option = options.find((o) => o.value === value);
        if (!option) return;
        onSelect(option);
      }}
    >
      {options.map((option) => {
        return (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        );
      })}
    </select>
  );
}
