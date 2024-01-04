import { selectEnv } from "@app/config";
import { useSelector } from "@app/react";
import { Link } from "react-router-dom";

const ProgressItem = ({ done = false }: { done?: boolean }) => {
  return (
    <div
      className={`w-[20px] h-[4px] border mr-3 ${
        done ? "bg-black border-black" : "bg-gray-100 border-gray-100"
      }`}
    >
      {" "}
    </div>
  );
};

export const ProgressProject = ({
  cur,
  total = 4,
  prev = "",
  next = "",
}: {
  cur: number;
  total?: number;
  prev?: string;
  next?: string;
}) => {
  const env = useSelector(selectEnv);
  const steps = [];
  for (let i = 1; i <= total; i += 1) {
    steps.push(<ProgressItem key={`step-${i}`} done={cur >= i} />);
  }
  const progress = <div className="flex items-center">{steps}</div>;

  if (env.isProduction && cur !== -1) {
    return <div className="my-6 flex justify-center">{progress}</div>;
  }

  return (
    <div className="my-6 flex justify-center">
      {progress}
      <div className="ml-4">
        {prev ? (
          <Link aria-disabled={!prev} to={prev} className="pr-2">
            Prev
          </Link>
        ) : null}
        {next ? (
          <Link aria-disabled={!next} to={next}>
            Next
          </Link>
        ) : null}
      </div>
    </div>
  );
};
