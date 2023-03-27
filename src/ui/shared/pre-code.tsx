import { SyntheticEvent } from "react";
import { IconCopy } from "./icons";
import { tokens } from "./tokens";

export const PreCode = ({
  children,
  allowCopy = false,
}: { children: React.ReactNode; allowCopy?: boolean }) => {
  const handleCopy = (e: SyntheticEvent) => {
    e.preventDefault();
    // TODO - THIS DOES NOT WORK PROPERLY WITHOUT UTIL/DEP
    navigator.clipboard.writeText(children?.toString() ?? "");
  };

  return (
    <>
      {allowCopy ? (
        <IconCopy
          color="#888C90"
          className="mt-4 mr-4 float-right"
          onClick={handleCopy}
        />
      ) : null}
      <pre className={`${tokens.type.pre} pr-14`}>{children}</pre>
    </>
  );
};
