import { Select } from "./select";

export interface SelectOption {
  label: string;
  value: string;
}

export const SelectMenu = ({ options }: { options: SelectOption[] }) => {
  const setSelection = () => {};
  return <Select options={options} onSelect={setSelection} />;
};
