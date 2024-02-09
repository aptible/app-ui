import { CopyTextButton } from "./copy";

export interface TextSegment {
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

export const PreText = ({
  text,
  className = "",
  allowCopy = true,
}: { className?: string; allowCopy?: boolean; text: string }) => {
  return (
    <div className="relative">
      <pre
        className={`p-4 rounded-lg text-sm pr-14 bg-black text-lime overflow-x-scroll ${className}`}
      >
        {text}
      </pre>
      {allowCopy ? (
        <CopyTextButton
          variant="left"
          relative={false}
          text={text}
          className="absolute right-2 top-4"
        />
      ) : null}
    </div>
  );
};

export const PreBox = ({
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

  return (
    <div className="relative">
      <pre className={`p-4 rounded-lg text-sm pr-14 ${className}`}>
        {segments.map(({ text, className }, idx) => {
          return (
            <span key={`${idx}-${text}`} className={className}>
              {text}
            </span>
          );
        })}
      </pre>
      {allowCopy ? (
        <CopyTextButton
          variant="left"
          relative={false}
          text={segments.map((t) => t.text).join("")}
          className="absolute right-2 top-4"
        />
      ) : null}
    </div>
  );
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
        <CopyTextButton
          variant="left"
          relative={false}
          text={segments.map((t) => t.text).join(" ")}
          className="absolute right-2 top-4"
        />
      ) : null}
    </div>
  );
};
