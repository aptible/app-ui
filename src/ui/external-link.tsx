import React from 'react';

import { Link } from '@aptible/arrow-ds';

export const ExternalLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  return (
    <Link target="_blank" href={href}>
      {children}
    </Link>
  );
};
