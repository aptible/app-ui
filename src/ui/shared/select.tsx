import { ListboxOption } from '@reach/listbox';
import { ChevronDownIcon } from '@heroicons/react/outline';

import {
  ListboxInput,
  ListboxButton,
  ListboxPopover,
  ListboxList,
} from './listbox';

export type SelectOption = { label: string; value: string };
type Props = {
  label: string;
  options: SelectOption[];
  defaultValue?: SelectOption;
  value?: SelectOption;
  onSelect: (s: string) => void;
};

export function Select({
  value,
  label,
  options,
  onSelect,
  defaultValue,
}: Props) {
  return (
    <ListboxInput
      value={value?.value}
      defaultValue={defaultValue?.value}
      onChange={onSelect}
    >
      <ListboxButton arrow={<ChevronDownIcon className="h-3 w-3" />}>
        {label}
      </ListboxButton>
      <ListboxPopover>
        <ListboxList>
          {options.map((option) => (
            <ListboxOption
              key={option.value}
              value={option.value}
              label={option.label}
            >
              {option.label}
            </ListboxOption>
          ))}
        </ListboxList>
      </ListboxPopover>
    </ListboxInput>
  );
}
