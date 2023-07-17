import { IconSearch } from "./icons";
import cn from "classnames";
import { forwardRef } from "react";
import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const classes = cn(
    "appearance-none block px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 text-base disabled:cursor-not-allowed disabled:opacity-50",
    props.className,
  );
  return (
    <input {...props} aria-label={props.name} ref={ref} className={classes} />
  );
});

interface InputSearchProps extends React.HTMLProps<HTMLDivElement> {
  search: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export const InputSearch = ({
  search,
  onChange,
  placeholder = "Search...",
  className = "w-[300px]",
  ...props
}: InputSearchProps) => {
  return (
    <div {...props} className={`flex relative ${className}`}>
      <IconSearch
        className="absolute top-[9px] left-[7px]"
        color="#595E63"
        variant="sm"
      />
      <Input
        placeholder={placeholder}
        type="text"
        value={search}
        onChange={onChange}
        className="pl-8 w-full"
      />
    </div>
  );
};
