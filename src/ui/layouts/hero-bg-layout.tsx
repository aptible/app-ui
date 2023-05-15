import { Outlet } from "react-router";
import { AptibleLogo } from "../shared";

export const HeroBgLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className="flex flex-col flex-1 h-full bg-no-repeat bg-center bg-cover"
      style={{
        backgroundImage: "url(/background-pattern-v2.png)",
      }}
    >
      <main className="flex-1">
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="py-4">
              <div className="flex justify-center container">
                <div style={{ width: 500 }}>
                  <div className="flex items-center justify-center mb-5">
                    <AptibleLogo width={160} />
                  </div>
                  <div className="mt-16">
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
