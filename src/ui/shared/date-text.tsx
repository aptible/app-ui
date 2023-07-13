import { capitalize } from "@app/string-utils";
import { Tooltip } from "./tooltip";
import {
  formatDateToUTC,
  prettyDateRelative,
  prettyEnglishDate,
  timeAgo,
} from "@app/date";

export const DateText = ({
  date,
  useUTCBefore24Hours = false,
  format = "utc-format",
}: {
  date: Date | string;
  useUTCBefore24Hours?: boolean;
  format?:
    | "utc-format"
    | "pretty-english"
    | "pretty-english-date-relative"
    | "time-ago";
}) => {
  // if using UTC format flag enabled for pre 24 hours AND it happened over 24 hours ago
  const useUTCDueToDateCutoff =
    useUTCBefore24Hours &&
    new Date().getTime() - 24 * 60 * 60 * 1000 >= new Date(date).getTime();
  if (useUTCDueToDateCutoff || format === "utc-format") {
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
        <span>{capitalize(prettyDateRelative(date.toString()))}</span>
      </Tooltip>
    );
  }
  return (
    <Tooltip text={formatDateToUTC(date.toString())}>
      <span>{capitalize(timeAgo(date.toString()))}</span>
    </Tooltip>
  );
};
