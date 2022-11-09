import cn from "classnames";
import { FC, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Checkbox: FC<InputProps> = (props) => {
	const className = cn(
		"h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded",
	);
	return <input {...props} type="checkbox" className={className} />;
};
