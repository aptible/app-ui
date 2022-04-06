import { homeUrl, securitySettingsUrl, sshSettingsUrl } from '@app/routes';
import { Link } from 'react-router-dom';

export const Nav = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full w-full">
      <div className="flex justify-between w-full">
        <Link to={homeUrl()}>Dashboard</Link>
        <Link to={securitySettingsUrl()}>Security Settings</Link>
        <Link to={sshSettingsUrl()}>SSH Settings</Link>
      </div>
      {children}
    </div>
  );
};
