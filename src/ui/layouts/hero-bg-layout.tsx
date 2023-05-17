import { AptibleLogo } from "../shared";
import { Outlet } from "react-router";

export const HeroBgLayout = ({
  showLogo = true,
  children,
  width = 500,
}: { showLogo?: boolean; children: React.ReactNode; width?: number }) => {
  return (
    <div
      className="flex flex-col flex-1 h-full bg-no-repeat bg-center bg-cover"
      style={{
        backgroundImage: "url(/background-pattern-v2.png)",
      }}
    >
      <main className="flex-1">
        <div className={showLogo ? "py-16" : "py-10"}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className={showLogo ? "py-4" : "py-0"}>
              <div className="flex justify-center container">
                <div style={{ width }}>
                  {showLogo ? (
                    <div className="flex items-center justify-center mb-5">
                      <AptibleLogo width={160} />
                    </div>
                  ) : null}
                  <div className={showLogo ? "mt-16" : "mt-0"}>
                    {children ? children : <Outlet />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
