// Reference document on error boundaries in React (updated docs - 03/2023)
// https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
// considered legacy and newer promised approaches are still in their backlog:
// https://github.com/facebook/react/issues/24595 and https://github.com/facebook/react/issues/14347
// possible alternatives also exist like this: https://github.com/JoschuaSchneider/use-error-boundary
// taken from: https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/error_boundaries/
import {
  ErrorBoundary as SentryErrorBoundary,
  captureException,
} from "@sentry/react";
import { ReactElement } from "react";
import { useRouteError } from "react-router";
import { Button, IconAlertTriangle } from "../shared";
import { HeroBgLayout } from "./hero-bg-layout";

function GenericErrorFallback({ error }: { error: Error | string }) {
  const errorString = typeof error === "string" ? error : error.message;
  return (
    <HeroBgLayout>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md h-screen">
        <div className="bg-white py-8 px-10 shadow rounded-lg">
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
    </HeroBgLayout>
  );
}

// StandaloneErrorBoundary - the purpose of this component is to act as a wrapper for Sentry errors.
// This extends Sentry's error boundary as per recommendation here:
// https://docs.sentry.io/platforms/javascript/guides/react/features/error-boundary/
// WARNING - this will NOT work in conjunction with react router and its own errorElements because
// it catches errors one level before going to sentry.
export const StandaloneErrorBoundary = ({
  children,
}: {
  children?: React.ReactNode;
}): ReactElement => {
  return (
    <SentryErrorBoundary
      fallback={({ error }: { error: Error }) => (
        <GenericErrorFallback error={error} />
      )}
    >
      {children}
    </SentryErrorBoundary>
  );
};

// ReactRouterErrorElement - the purpose of this component is to act as a wrapper for react router errors
// and then reuse the same error fallback component supplied above. This is done because errors will not
// bubble up the same way and are fully caught by react router. Since this gets caught, the React
// ErrorBoundary will never raise its OWN error and you will end up with no messaging (a blank page
// as an error occurred, but without react knowing an error has occurred, thus never using the ErrorBoundary)
// Link: https://reactrouter.com/en/main/route/error-element
// See this comment:
//    If you do not provide an errorElement in your route tree to handle a given error,
//    errors will bubble up and be handled by a default errorElement which will print
//    the error message and stack trace. Some folks have questioned why the stack trace
//    shows up in production builds.
export const ReactRouterErrorElement = () => {
  const error = useRouteError();
  const errorData: string | Error =
    error instanceof Error ? (error as Error) : (error as any).toString();
  if (error) {
    captureException(error);
  }
  return (
    <div>
      <GenericErrorFallback error={errorData} />
    </div>
  );
};
