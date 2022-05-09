import { useState } from 'react';
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
  const [selection, setSelection] = useState<string>('');
  const selectedStack = stacks.find(
    (stack) => stack.id.toString() === selection,
  );
  return (
    <ListboxInput onChange={setSelection} defaultValue="popeyes">
      <ListboxButton arrow={<ChevronDownIcon className="h-3 w-3" />}>
        {selectedStack ? selectedStack.name : 'Filter by Stack'}
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
