import { ApplicationSidebar } from "../shared";

type Props = {
  children: React.ReactNode;
  margin?: boolean;
};

export function ListingPageLayout({ children, margin = true }: Props) {
  return (
    <>
      <div>
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
          <ApplicationSidebar />
        </div>

        <div className="md:pl-64 flex flex-col flex-1">
          <main className="flex-1">
            <div className={margin ? "mx-auto px-4 sm:px-6 md:px-8" : ""}>
              <div className={margin ? "py-4" : ""}>{children}</div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
