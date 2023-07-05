import { Button } from "./button";
import { PreCode, listToInvertedTextColor } from "./pre-code";
import { useState } from "react";

export const Secret = ({
  secret,
  showAsOpened = false,
}: { secret: string; showAsOpened?: boolean }) => {
  const [isShowing, setIsShowing] = useState<boolean>(showAsOpened);
  return (
    <div className="flex gap-4">
      {isShowing ? (
        <PreCode segments={listToInvertedTextColor([secret])} allowCopy />
      ) : null}
      <div>
        <Button
          className={isShowing ? "mt-2 px-0" : "px-0"}
          size="sm"
          variant="white"
          onClick={() => setIsShowing(!isShowing)}
        >
          {isShowing ? "Hide" : "Show"}
        </Button>
      </div>
    </div>
  );
};
