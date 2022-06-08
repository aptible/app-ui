import { ChevronDownIcon } from '@heroicons/react/outline';
import { ListboxOption } from '@reach/listbox';
import type { DeployStack } from '@app/types';

import {
  ListboxInput,
  ListboxButton,
  ListboxPopover,
  ListboxList,
} from './listbox';

export const SelectStackMenu = ({ stacks }: { stacks: DeployStack[] }) => {
  const setSelection = () => {};
  return (
    <ListboxInput onChange={setSelection}>
      <ListboxButton size="xl" arrow={<ChevronDownIcon className="h-3 w-3" />}>
        Filter by Stack
      </ListboxButton>
      <ListboxPopover>
        <ListboxList>
          {stacks.map((stack) => (
            <ListboxOption key={stack.id} value={stack.id.toString()}>
              {stack.name}
            </ListboxOption>
          ))}
        </ListboxList>
      </ListboxPopover>
    </ListboxInput>
  );
};
