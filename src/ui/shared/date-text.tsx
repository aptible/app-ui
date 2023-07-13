import { Tooltip } from "./tooltip";
import {
  formatDateToUTC,
  prettyDateRelative,
  prettyEnglishDate,
  timeAgo,
} from "@app/date";

export const DateText = ({
  date,
  format = "utc-format",
}: {
  date: Date | string;
  format?:
    | "utc-format"
    | "pretty-english"
    | "pretty-english-date-relative"
    | "time-ago";
}) => {
  if (format === "utc-format") {
    return <span>{formatDateToUTC(date.toString())}</span>;
  }
  if (format === "pretty-english") {
    return (
      <Tooltip text={formatDateToUTC(date.toString())}>
        <span>{prettyEnglishDate(date.toString())}</span>
      </Tooltip>
    );
  }
  if (format === "pretty-english-date-relative") {
    return (
      <Tooltip text={formatDateToUTC(date.toString())}>
        <span>{prettyDateRelative(date.toString())}</span>
      </Tooltip>
    );
  }
  return (
    <Tooltip text={formatDateToUTC(date.toString())}>
      <span>{timeAgo(date.toString())}</span>
    </Tooltip>
  );
};
