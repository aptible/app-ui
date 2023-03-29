import { IconCopy } from "./icons";
import { SyntheticEvent } from "react";

export const PreCode = ({
  allowCopy = false,
  invertedColors = true,
  text, // TODO - do we want to do this
}: {
  allowCopy?: boolean;
  invertedColors?: boolean;
  text: string[];
}) => {
  const handleCopy = (e: SyntheticEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(text.join(" "));
  };

  const preTextColor = invertedColors ? "text-white" : "text-black";
  const preStyle = invertedColors
    ? "p-4 bg-black rounded"
    : "p-4 bg-gray-100 rounded";

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
      <pre className={`${preStyle} ${preTextColor} text-sm pr-14`}>
        {text.map((textElem, idx) => {
          const lastElement = idx === text.length - 1;
          const highlightedText =
            !invertedColors || lastElement ? preTextColor : "text-lime";
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
