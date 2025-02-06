import React, { useEffect, useState } from "react";

const TEXT_ANIMATION_INTERVAL = 150;
const ELLIPSIS_INTERVAL = 500;

export const StreamingText = ({
  text,
  showEllipsis = false,
  animate = true,
}: { text: string; showEllipsis?: boolean; animate?: boolean }) => {
  const words = text.split(" ");
  const [visibleWords, setVisibleWords] = React.useState<number>(
    animate ? 0 : words.length,
  );
  const [isComplete, setIsComplete] = React.useState<boolean>(!animate);

  React.useEffect(() => {
    if (!animate) return;

    const timer = setInterval(() => {
      setVisibleWords((prev) => {
        if (prev < words.length) {
          return prev + 1;
        }
        clearInterval(timer);
        setIsComplete(true);
        return prev;
      });
    }, TEXT_ANIMATION_INTERVAL);

    return () => clearInterval(timer);
  }, [words.length, animate]);

  return (
    <div className="inline-block">
      {words.map((word, idx) => (
        <span
          key={idx}
          className={`inline-block ${idx < words.length - 1 ? "mr-1" : ""} ${idx < visibleWords ? "" : "hidden"}`}
        >
          {word}
        </span>
      ))}
      {showEllipsis && isComplete && <AnimatedEllipsis />}
    </div>
  );
};

export const AnimatedEllipsis = () => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return "";
        return `${prev}.`;
      });
    }, ELLIPSIS_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return <span className="inline-block w-6">{dots}</span>;
};
