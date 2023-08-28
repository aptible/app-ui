import { ButtonSensitive } from "./button";
import { PreCode, listToInvertedTextColor } from "./pre-code";
import { useState } from "react";

export const Secret = ({
  envId,
  secret,
}: { secret: string; envId: string }) => {
  const [isShowing, setIsShowing] = useState<boolean>(false);
  return (
    <div className="flex gap-4">
      {isShowing ? (
        <PreCode segments={listToInvertedTextColor([secret])} allowCopy />
      ) : null}
      <div>
        <ButtonSensitive
          envId={envId}
          className={isShowing ? "mt-2 px-0" : "px-0"}
          size="sm"
          variant="white"
          onClick={() => setIsShowing(!isShowing)}
        >
          {isShowing ? "Hide" : "Show"}
        </ButtonSensitive>
      </div>
    </div>
  );
};
