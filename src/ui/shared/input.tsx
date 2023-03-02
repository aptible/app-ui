import { forwardRef } from "react";
import cn from "classnames";
import { InputHTMLAttributes } from "react";
import { IconSearch } from "./icons";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const classes = cn(
    "appearance-none block px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm",
    props.className,
  );
  return <input {...props} ref={ref} className={classes} />;
});

interface InputSearchProps extends React.HTMLProps<HTMLDivElement> {
  search: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export const InputSearch = ({
  search,
  onChange,
  placeholder = "Search ...",
  className = "",
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
        className="pl-8 w-1/3"
      />
    </div>
  );
};
