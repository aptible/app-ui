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
    <div className="relative">
      <pre className={`p-4 rounded text-sm pr-14 overflow-x-auto ${className}`}>
        {segments.map(({ text, className }, idx) => {
          return (
            <span key={`${idx}-${text}`} className={className}>
              {text}
              {idx === segments.length - 1 ? "" : " "}
            </span>
          );
        })}
      </pre>
      {allowCopy ? (
        <div
          title="Copy to clipboard"
          className="absolute cursor-pointer"
          style={{ right: 10, top: 12 }}
        >
          <IconCopy color="#888C90" onClick={handleCopy} />
        </div>
      ) : null}
    </div>
  );
};
