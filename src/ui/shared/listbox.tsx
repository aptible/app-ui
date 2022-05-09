import cn from 'classnames';

import {
  Listbox as ReachListbox,
  ListboxProps,
  ListboxInput as ReachListboxInput,
  ListboxInputProps,
  ListboxButton as ReachListboxButton,
  ListboxButtonProps,
  ListboxPopover as ReachListboxPopover,
  ListboxPopoverProps,
  ListboxList as ReachListboxList,
  ListboxListProps,
  ListboxOption as ReachListboxOption,
  ListboxOptionProps,
} from '@reach/listbox';

import { tokens } from './tokens';
import { Size } from './button';

import './menu.css';

export const Listbox = (props: ListboxProps) => (
  <ReachListbox className={cn()} {...props} />
);
export const ListboxInput = (props: ListboxInputProps) => (
  <ReachListboxInput className={''} {...props} />
);

export const ListboxButton = (props: ListboxButtonProps & { size?: Size }) => {
  const { size = 'md' } = props;
  const classes = cn(
    tokens.buttons.sizes[size],
    tokens.buttons.styles.white,
    'rounded-md',
    'items-center flex gap-2 text-left w-full',
  );
  return <ReachListboxButton className={classes} {...props} />;
};

export const ListboxPopover = (props: ListboxPopoverProps) => {
  const styles = [
    'rounded-lg',
    'shadow-lg',
    'mt-1',
    'border-gray-300 dark:border-gray-600',
  ].join(' ');
  return <ReachListboxPopover className={styles} {...props} />;
};
export const ListboxList = (props: ListboxListProps) => (
  <ReachListboxList className={''} {...props} />
);

export const ListboxOption = (props: ListboxOptionProps) => (
  <ReachListboxOption
    className={cn(tokens.type['small normal'], 'px-4 py-2')}
    {...props}
  />
);
