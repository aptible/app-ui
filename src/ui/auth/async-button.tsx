import React from 'react';
import { ArrowButton, ArrowButtonProps } from '@aptible/arrow-ds';

type Props = ArrowButtonProps & {
  inProgress: boolean;
  label: string;
};

export const AsyncButton = ({
  disabled,
  inProgress,
  label,
  type,
  onClick,
  className,
  ...rest
}: Props) => {
  return (
    <ArrowButton
      as="button"
      loading={inProgress}
      disabled={disabled || inProgress}
      onClick={onClick}
      className={className}
      type={type}
      {...rest}
    >
      {inProgress ? 'Working…' : label}
    </ArrowButton>
  );
};
