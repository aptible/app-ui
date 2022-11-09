import { Button } from "./button";
import { Select } from "./select";

export interface SelectOption {
	label: string;
	value: string;
}

export const SelectMenu = ({
	name,
	options,
}: {
	name: string;
	options: SelectOption[];
}) => {
	const setSelection = () => {};
	return (
		<div>
			<Button>Filter by {name}</Button>
			<Select options={options} onSelect={setSelection} />
		</div>
	);
};
