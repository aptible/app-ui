import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/outline';
import {
  ListboxInput,
  ListboxButton,
  ListboxPopover,
  ListboxList,
  ListboxOption,
} from './listbox';

import type { DeployEnvironment } from '@app/types';

export const SelectEnvironmentMenu = ({
  environments,
}: {
  environments: DeployEnvironment[];
}) => {
  const [selection, setSelection] = useState<string>('');
  const selectedEnvironment = environments.find((env) => env.id === selection);
  return (
    <ListboxInput onChange={setSelection}>
      <ListboxButton arrow={<ChevronDownIcon className="h-3 w-3" />}>
        {selectedEnvironment
          ? selectedEnvironment.handle
          : 'Filter by Environment'}
      </ListboxButton>
      <ListboxPopover>
        <ListboxList>
          {environments.map((environment) => (
            <ListboxOption
              key={environment.id}
              label={environment.handle}
              value={environment.id.toString()}
            />
          ))}
        </ListboxList>
      </ListboxPopover>
    </ListboxInput>
  );
};
