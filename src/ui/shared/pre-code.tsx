import { IconCopy } from "./icons";
import { tokens } from "./tokens";
import { SyntheticEvent } from "react";

export const PreCode = ({
  allowCopy = false,
  text, // TODO - do we want to do this
}: {
  allowCopy?: boolean;
  text: string[];
}) => {
  const handleCopy = (e: SyntheticEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(text.join(" "));
  };

  return (
    <>
      {allowCopy ? (
        <IconCopy
          color="#888C90"
          className="mt-4 mr-4 float-right"
          onClick={handleCopy}
          style={{ cursor: "pointer" }}
        />
      ) : null}
      <pre className={`${tokens.type.pre} text-sm pr-14`}>
        {text.map((textElem, idx) => {
          const lastElement = idx === text.length - 1;
          const highlightedText = lastElement ? "" : "text-lime";
          return (
            <span key={`${idx}-${textElem}`} className={highlightedText}>
              {textElem}
              {!lastElement && " "}
            </span>
          );
        })}
      </pre>
    </>
  );
};
