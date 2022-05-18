import cn from 'classnames';

import { tokens, ApplicationSidebar, SettingsSidebar } from '../shared';

type Props = {
  children: React.ReactNode;
};

export function SettingsPageLayout({ children }: Props) {
  return (
    <>
      <div className="flex w-full h-full">
        <div className="flex w-64 flex-col inset-y-0 h-screen">
          <ApplicationSidebar />
        </div>

        <div className="flex w-64 flex-col inset-y-0 h-screen">
          <SettingsSidebar />
        </div>

        <div className="flex flex-col flex-1">
          <main className={cn(tokens.layout['main width'], 'py-6')}>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
