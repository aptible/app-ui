import cn from "classnames";
import { forwardRef } from "react";
import { InputHTMLAttributes } from "react";
import { IconSearch } from "./icons";
import { tokens } from "./tokens";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const classes = cn(
    "appearance-none outline-none",
    "leading-none",
    "p-3",
    "border border-gray-300 placeholder-gray-400 rounded-md shadow-sm",
    "focus:ring-inset focus:ring-gray-500 focus:border-gray-500",
    "disabled:cursor-not-allowed disabled:opacity-50",
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
  className = "w-[300px] h-[36px]",
  autoFocus = false,
  ...props
}: InputSearchProps) => {
  return (
    <div {...props} className={`flex relative ${className}`}>
      <IconSearch
        className="absolute top-[10px] left-[10px]"
        color="#595E63"
        variant="sm"
      />
      <Input
        placeholder={placeholder}
        type="text"
        value={search}
        onChange={onChange}
        autoFocus={autoFocus}
        className="pl-9 w-full"
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
}: InputProps & { label: React.ReactNode }) => (
  <label className="flex">
    <Input
      type="checkbox"
      className={`rounded-lg h-6 ${className}`}
      {...props}
    />
    <span className="ml-1">{label}</span>
  </label>
);
