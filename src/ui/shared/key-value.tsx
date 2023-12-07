interface KeyValueProps {
  variant?: "vertical" | "horizontal";
  data: { key: string; value: string | number }[];
}

export const KeyValueGroup = ({
  variant = "horizontal",
  data,
}: KeyValueProps) => {
  const cls =
    variant === "horizontal" ? "flex justify-between keyval" : "keyval";

  return (
    <dl>
      {data.map((d) => {
        return (
          <div key={d.key} className={cls}>
            <dt className="font-bold">{d.key}: </dt>
            <dd>{d.value}</dd>
          </div>
        );
      })}
    </dl>
  );
};
