import { IconSearch } from "./icons";
import { tokens } from "./tokens";
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
  autoFocus = false,
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
        autoFocus={autoFocus}
        className="pl-8 w-full"
      />
    </div>
  );
};

export const TextArea = ({
  className,
  ...props
}: React.DetailedHTMLProps<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  HTMLTextAreaElement
>) => {
  return (
    <textarea className={`${tokens.type.textarea} ${className}`} {...props} />
  );
};

export const CheckBox = ({
  className,
  label,
  ...props
}: InputProps & { label: string }) => (
  <label className="flex">
    <Input
      type="checkbox"
      className={`rounded-lg h-6 ${className}`}
      {...props}
    />
    <span className="ml-1">{label}</span>
  </label>
);
