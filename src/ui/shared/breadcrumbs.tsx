import cn from 'classnames';
import { NavLink } from 'react-router-dom';
import { tokens } from './tokens';

export type Crumb = {
  name: string;
  to: string;
};

const navLink = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center',
    { [tokens.type.link]: !isActive },
    { [tokens.type['subdued active link']]: isActive },
  );

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center">
        {crumbs.map((crumb) => (
          <li key={crumb.name}>
            <NavLink className={navLink} to={crumb.to}>
              {crumb.name}
            </NavLink>
          </li>
        ))}
      </ol>
    </nav>
  );
}
