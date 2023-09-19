import { SyntheticEvent } from "react";
import { IconCopy } from "./icons";

interface TextSegment {
  text: string;
  className: string;
}

const createTextColor =
  (len = 0, color = "text-white", highlight = "text-lime") =>
  (txt: string, idx: number): TextSegment => {
    const lastElement = idx === len - 1;
    return {
      text: txt,
      className: lastElement ? color : highlight,
    };
  };

export const listToInvertedTextColor = (list: string[]): TextSegment[] => {
  return list.map(createTextColor(list.length));
};

export const listToTextColor = (list: string[]): TextSegment[] => {
  return list.map(createTextColor(list.length, "text-black"));
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
      <code
        className={`p-4 rounded-lg text-sm pr-14 overflow-x-auto block [overflow-wrap:anywhere] ${className}`}
      >
        {segments.map(({ text, className }, idx) => {
          return (
            <span key={`${idx}-${text}`} className={className}>
              {text}
              {idx === segments.length - 1 ? "" : " "}
            </span>
          );
        })}
      </code>
      {allowCopy ? (
        <div
          title="Copy to clipboard"
          className="absolute cursor-pointer bg-black px-2"
          style={{ right: 0, top: 12 }}
        >
          <IconCopy
            className="active:opacity-50"
            color="#888C90"
            onClick={handleCopy}
          />
        </div>
      ) : null}
    </div>
  );
};
