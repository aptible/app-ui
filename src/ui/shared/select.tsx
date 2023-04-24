import cn from "classnames";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  options: SelectOption[];
  defaultValue?: SelectOption;
  value?: SelectOption;
  onSelect: (s: SelectOption) => void;
  className?: string;
}

export function Select({
  value,
  options,
  onSelect,
  defaultValue,
  className = "",
}: SelectProps) {
  const finClassName = cn(
    "border-black-100 text-black",
    "hover:border-black hover:text-black-300",
    "active:border-black-100 active:text-black",
    "disabled:bg-black-50 disabled:border-black-100 disabled:text-black",
    "rounded-md shadow-sm",
    className,
  );
  return (
    <select
      name="stack"
      className={finClassName}
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
