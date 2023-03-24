// Reference document on error boundaries in React (updated docs - 03/2023)
// https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
// considered legacy and newer promised approaches are still in their backlog:
// https://github.com/facebook/react/issues/24595 and https://github.com/facebook/react/issues/14347
// possible alternatives also exist like this: https://github.com/JoschuaSchneider/use-error-boundary
// taken from: https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/error_boundaries/

import { Component, ErrorInfo, ReactNode } from "react";
import { AptibleLogo, Button, IconAlertTriangle } from "../shared";

interface Props {
  children?: ReactNode;
}

interface State {
  message: string;
  name: string;
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    message: "Error - something went wrong",
    name: "Error - something went wrong",
    hasError: false,
  };

  public static getDerivedStateFromError(err: Error): State {
    // TODO - we likely want to curate error messages based on the common type guards here
    // with possible custom logic on help text
    return {
      message: err.message ?? "Error - something went wrong",
      name: err.name ?? "Error - something went wrong",
      hasError: true,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // TODO - likely want to submit sentry errors here under specific cases
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
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
                  {this.state.name}
                </h1>
                <p className="my-5">{this.state.message}</p>
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

    return this.props.children;
  }
}
