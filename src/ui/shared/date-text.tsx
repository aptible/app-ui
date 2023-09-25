import {
  formatDateToUTC,
  prettyDateRelative,
  prettyEnglishDate,
  timeAgo,
} from "@app/date";
import { Tooltip } from "./tooltip";

export const DateText = ({
  date,
  format = "utc-format",
}: {
  date: Date;
  format?:
    | "utc-format"
    | "pretty-english"
    | "pretty-english-date-relative"
    | "time-ago";
}) => {
  if (format === "utc-format") {
    return <span>{formatDateToUTC(date.toISOString())}</span>;
  }
  if (format === "pretty-english") {
    return (
      <Tooltip text={formatDateToUTC(date.toISOString())}>
        <span>{prettyEnglishDate(date.toISOString())}</span>
      </Tooltip>
    );
  }
  if (format === "pretty-english-date-relative") {
    return (
      <Tooltip text={formatDateToUTC(date.toISOString())}>
        <span>{prettyDateRelative(date.toISOString())}</span>
      </Tooltip>
    );
  }
  return (
    <Tooltip text={formatDateToUTC(date.toISOString())}>
      <span>{timeAgo(date.toISOString())}</span>
    </Tooltip>
  );
};
