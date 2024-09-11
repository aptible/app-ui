interface KeyValueProps {
  variant?: "vertical" | "horizontal" | "horizontal-inline";
  data: { key: string; value: string | number }[];
}

export const KeyValueGroup = ({
  variant = "horizontal",
  data,
}: KeyValueProps) => {
  let cls: string;
  switch (variant) {
    case "horizontal":
      cls = "flex justify-between keyval";
      break;
    case "horizontal-inline":
      cls = "flex keyval";
      break;
    case "vertical":
      cls = "keyval";
      break;
  }

  return (
    <dl>
      {data.map((d) => {
        return (
          <div key={d.key} className={cls}>
            <dt className="font-bold">{d.key}: </dt>
            <dd className={variant === "horizontal-inline" ? "pl-2" : ""}>
              {d.value}
            </dd>
          </div>
        );
      })}
    </dl>
  );
};
