import cn from "classnames";

import { variantToColor } from "@app/status-variant";

export const BannerMessages = (props: {
  isSuccess: boolean;
  isError: boolean;
  message: string;
  className?: string;
}) => {
  const cls = "p-4 border rounded";
  return (
    <div className={props.className}>
      {props.isSuccess ? (
        <div className={cn(cls, variantToColor("success"))} role="status">
          Success! {props.message}
        </div>
      ) : null}
      {props.isError ? (
        <div className={cn(cls, variantToColor("error"))} role="status">
          {props.message}
        </div>
      ) : null}
    </div>
  );
};
