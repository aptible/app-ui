import cn from "classnames";
import { Children, cloneElement } from "react";

export interface SelectOption<V = string> {
  label: string;
  value: V;
}

export interface SelectProps<V = string> {
  id?: string;
  options: SelectOption[];
  defaultValue?: string;
  value?: string;
  onSelect: (s: SelectOption<V>) => void;
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function Select<V = string>({
  id,
  value,
  options,
  onSelect,
  defaultValue,
  className = "",
  ariaLabel = "combobox",
  disabled = false,
  placeholder = "Select",
}: SelectProps<V>) {
  const finClassName = cn(
    "border-black-100 text-black",
    "hover:border-black",
    "active:border-black-100 active:text-black",
    "disabled:bg-black-50 disabled:border-black-100 disabled:text-black",
    "rounded-md shadow-sm",
    className,
  );
  return (
    <select
      id={id}
      aria-label={ariaLabel}
      className={finClassName}
      value={value}
      defaultValue={defaultValue}
      placeholder={placeholder}
      onChange={(e) => {
        const value = e.currentTarget.value;
        const option = options.find((o) => o.value === value);
        if (!option) return;
        onSelect(option as any);
      }}
      disabled={disabled}
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

type InputValue = string | number | readonly string[] | undefined;

interface RadioProps<V extends InputValue> {
  name: string;
  selected: V;
  onSelect: (v: V) => void;
}

export function Radio<V extends InputValue = string>({
  value,
  children,
  selected,
  name = "",
  onSelect = () => {},
  disabled = false,
  className = "",
}: {
  value: V;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
} & Partial<RadioProps<V>>) {
  return (
    <label className="flex items-center">
      <input
        type="radio"
        name={name}
        value={value}
        checked={selected === value}
        onChange={() => onSelect(value)}
        disabled={disabled}
      />
      <span className={`ml-1 ${className}`}>{children}</span>
    </label>
  );
}

export function RadioGroup<V extends InputValue>({
  children,
  className = "",
  ...props
}: {
  children: React.ReactNode;
  className?: string;
} & RadioProps<V>) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {Children.map(children, (child) =>
        cloneElement(child as any, { ...props }),
      )}
    </div>
  );
}
