import cn from "classnames";

type Element = JSX.Element | React.ReactNode;
export type ActionList = Element[];
type ActionListProps = {
	actions: ActionList;
	className?: string;
	align?: "left" | "right";
};

export function ActionListView({
	actions,
	className,
	align = "right",
}: ActionListProps) {
	if (actions.length > 2) {
		console.warn(
			"Avoid adding 3 or more actions. Instead, use a ListBox or Menu Component to provide more actions",
		);
	}
	const classes = cn(
		className,
		{
			"justify-start": align === "left",
			"justify-end": align === "right",
		},
		"gap-2 flex h-full",
	);

	return (
		<div className={classes}>
			{actions &&
				actions.map((a, i) => (
					<div className="self-end" key={`action-${i}`}>
						{a}
					</div>
				))}
		</div>
	);
}
