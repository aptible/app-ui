// Reference document on error boundaries in React (updated docs - 03/2023)
// https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
// considered legacy and newer promised approaches are still in their backlog:
// https://github.com/facebook/react/issues/24595 and https://github.com/facebook/react/issues/14347
// possible alternatives also exist like this: https://github.com/JoschuaSchneider/use-error-boundary
// taken from: https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/error_boundaries/

import { AptibleLogo, Button, IconAlertTriangle } from "../shared";
import { ErrorBoundary as SentryErrorBoundary } from "@sentry/react";
import { ReactElement } from "react";

function ErrorFallback({ error }: { error: Error | string }) {
  const errorString = typeof error === "string" ? error : error.message;
  return (
    <div
      className="flex-1 h-full bg-no-repeat bg-center bg-cover"
      style={{
        backgroundImage: "url(/background-pattern-v2.png)",
      }}
    >
      <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex items-center justify-center">
            <AptibleLogo />
          </div>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <h1 className="text-lg font-semibold text-red mb-">
              <IconAlertTriangle
                className="inline -mt-1 mr-2"
                color="#AD1A1A"
                style={{ width: 21, height: 21 }}
              />
              Something's gone wrong
            </h1>
            <p className="my-5">{errorString}</p>
            <hr />
            <div className="flex mt-4 -mb-6">
              <Button
                className="w-40 mb-4 flex"
                onClick={() => {
                  history.back();
                }}
              >
                <span className="text-sm">Back</span>
              </Button>
              <Button
                className="w-40 ml-4 mb-4 flex"
                onClick={() => {
                  location.href = "/login";
                }}
                variant="white"
              >
                <span className="text-sm">Login</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const ErrorBoundary = ({
  children,
}: { children?: React.ReactNode }): ReactElement => {
  return (
    <SentryErrorBoundary fallback={({ error }: { error: Error }) => (
      <ErrorFallback error={error} />
    )}>
      {children}
    </SentryErrorBoundary>
  );
};
