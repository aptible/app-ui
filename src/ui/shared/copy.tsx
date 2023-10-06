import { useEffect, useState } from "react";
import { IconCopy } from "./icons";
import { Tooltip, TooltipProps } from "./tooltip";

const copy = async (text: string) => {
  if (typeof navigator === "undefined") return;
  if (typeof navigator.clipboard === "undefined") return;
  await navigator.clipboard.writeText(text);
};

export const CopyText = ({ text }: { text: string }) => {
  return (
    <div className="flex items-center gap-2">
      <div>{text}</div>
      <CopyTextButton text={text} />
    </div>
  );
};

export const CopyTextButton = ({
  text,
  color = "#888C90",
  ...tooltipProps
}: {
  text: string;
  color?: string;
} & Omit<TooltipProps, "children" | "text">) => {
  const [success, setSuccess] = useState(false);
  const onClick = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();

    copy(text).then(() => {
      setSuccess(true);
    });
  };

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      setSuccess(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [success]);

  return (
    <Tooltip text={success ? "Copied!" : "Copy"} {...tooltipProps} fluid>
      <IconCopy
        variant="sm"
        className={"active:opacity-50"}
        color={color}
        onClick={(e) => onClick(e)}
      />
    </Tooltip>
  );
};
