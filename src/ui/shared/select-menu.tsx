import { ChevronDownIcon } from '@heroicons/react/outline';
import { ListboxOption } from '@reach/listbox';

import {
  ListboxInput,
  ListboxButton,
  ListboxPopover,
  ListboxList,
} from './listbox';

export interface SelectOption {
  label: string;
  value: string;
}

export const SelectMenu = ({
  name,
  options,
}: {
  name: string;
  options: SelectOption[];
}) => {
  const setSelection = () => {};
  return (
    <ListboxInput onChange={setSelection}>
      <ListboxButton size="xl" arrow={<ChevronDownIcon className="h-3 w-3" />}>
        Filter by {name}
      </ListboxButton>
      <ListboxPopover>
        <ListboxList>
          {options.map((opt) => (
            <ListboxOption key={opt.value} value={opt.value}>
              {opt.label}
            </ListboxOption>
          ))}
        </ListboxList>
      </ListboxPopover>
    </ListboxInput>
  );
};
