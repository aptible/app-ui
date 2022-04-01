import { Link } from 'react-router-dom';
import classNames from 'classnames';

export const HelpLink = ({
  children,
  className = '',
  to,
}: {
  children: React.ReactNode;
  to: string;
  className?: string;
}) => {
  return (
    <Link
      to={to}
      className={classNames(
        'text-brandGreen-400',
        'no-underline',
        'focus:underline',
        'focus:text-gold-400',
        'hover:underline',
        'hover:text-gold-400',
        'leading-normal',
        className,
      )}
      style={{ letterSpacing: '0.02em' }}
    >
      {children}
    </Link>
  );
};
