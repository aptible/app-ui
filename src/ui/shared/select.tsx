export type SelectOption = { label: string; value: string };
type Props = {
	options: SelectOption[];
	defaultValue?: SelectOption;
	value?: SelectOption;
	onSelect: (s: string) => void;
};

export function Select({ value, options, onSelect, defaultValue }: Props) {
	return (
		<select
			value={value?.value}
			defaultValue={defaultValue?.value}
			onChange={(e) => onSelect(e.currentTarget.value)}
		>
			{options.map((option) => {
				return (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				);
			})}
		</select>
	);
}
