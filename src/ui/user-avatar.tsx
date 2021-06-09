import React from 'react';
import { Avatar, AvatarSize, AVATAR_TYPE, BoxProps } from '@aptible/arrow-ds';

interface UserAvatarProps extends BoxProps {
  name: string;
  email: string;
  size?: AvatarSize;
  square?: boolean;
  enableTooltip?: boolean;
  bordered?: boolean;
}

export const UserAvatar = ({
  name,
  email: emailProp,
  size = 'medium',
  square = false,
  enableTooltip = true,
  bordered = false,
  ...rest
}: UserAvatarProps) => {
  // Use name as a fallback if emailProp is an empty string
  const email = emailProp || name;

  return (
    <Avatar
      email={email}
      name={name}
      square={square}
      size={size}
      type={AVATAR_TYPE.USER}
      alt={name}
      enableTooltip={enableTooltip}
      bordered={bordered}
      {...rest}
    />
  );
};
