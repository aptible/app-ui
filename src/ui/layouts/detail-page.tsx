import cn from "classnames";

import { ApplicationSidebar, tokens } from "../shared";

type Props = {
  children: React.ReactNode;
  header: React.ReactNode;
};

export function DetailPageLayout({ children, header }: Props) {
  return (
    <>
      <div>
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
          <ApplicationSidebar />
        </div>

        <div className="md:pl-64 flex flex-col flex-1">
          {header}
          <main className={cn(tokens.layout["main width"], "py-0")}>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
