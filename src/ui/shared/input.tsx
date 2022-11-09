import { forwardRef } from "react";
import cn from "classnames";
import { InputHTMLAttributes } from "react";

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
