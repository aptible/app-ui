export const ErrorPage = () => {
  const willThrow = () => {
    throw "Error - Something went wrong.";
  };
  return <div>{willThrow()}</div>;
};
