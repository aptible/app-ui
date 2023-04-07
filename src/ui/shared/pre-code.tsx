import { IconCopy } from "./icons";
import { SyntheticEvent } from "react";

interface TextSegment {
  text: string;
  className: string;
}

const createTextColor =
  (color = "text-white", highlight = "text-lime") =>
  (txt: string, idx: number): TextSegment => {
    const lastElement = idx === txt.length - 1;
    return {
      text: txt,
      className: lastElement ? color : highlight,
    };
  };

export const listToInvertedTextColor = (list: string[]): TextSegment[] => {
  return list.map(createTextColor());
};

export const listToTextColor = (list: string[]): TextSegment[] => {
  return list.map(createTextColor("text-black"));
};

export const PreCode = ({
  segments,
  className = "bg-black",
  allowCopy = false,
}: {
  segments: TextSegment[];
  className?: string;
  allowCopy?: boolean;
}) => {
  if (segments.length === 0) {
    return null;
  }

  const handleCopy = (e: SyntheticEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(segments.map((t) => t.text).join(" "));
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
      <pre className={`p-4 rounded text-sm pr-14 ${className}`}>
        {segments.map(({ text, className }, idx) => {
          return (
            <span key={`${idx}-${text}`} className={className}>
              {text}
              {idx === segments.length - 1 ? "" : " "}
            </span>
          );
        })}
      </pre>
    </>
  );
};
