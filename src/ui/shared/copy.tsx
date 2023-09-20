import { useState } from "react";
import { IconCopy } from "./icons";
import { Tooltip } from "./tooltip";

export const CopyText = ({ text }: { text: string }) => {
  const [success, setSuccess] = useState(false);
  const copy = async () => {
    if (typeof navigator === "undefined") {
      return;
    }

    if (typeof navigator.clipboard === "undefined") {
      return;
    }

    await navigator.clipboard.writeText(text);
  };

  const onClick = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();

    copy().then(() => {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 1500);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <div>{text}</div>
      <Tooltip text={success ? "Copied!" : "Copy"}>
        <IconCopy
          variant="sm"
          className="ml-2 active:opacity-50"
          color="#888C90"
          onClick={(e) => onClick(e)}
        />
      </Tooltip>
    </div>
  );
};
