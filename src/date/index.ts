import {
  format,
  formatDistanceStrict,
  formatDistanceToNowStrict,
  formatRelative,
  parseISO,
} from "date-fns";
import locale from "date-fns/locale/en-US";

const FormatDistanceLocale: { [key: string]: string } = {
  lessThanXSeconds: "{{count}}s",
  xSeconds: "{{count}}s",
  halfAMinute: "30s",
  lessThanXMinutes: "{{count}}min",
  xMinutes: "{{count}}min",
  aboutXHours: "{{count}}hr",
  xHours: "{{count}}hr",
  xDays: "{{count}}d",
  aboutXWeeks: "{{count}}wk",
  xWeeks: "{{count}}wk",
  aboutXMonths: "{{count}}mo",
  xMonths: "{{count}}mo",
  aboutXYears: "{{count}}yr",
  xYears: "{{count}}yr",
  overXYears: "{{count}}yr",
  almostXYears: "{{count}}yr",
};

const formatDistanceAgo = (token: string, count: string, opts: any): string => {
  const options = opts || {};

  const result = FormatDistanceLocale[token].replace("{{count}}", count);

  if (options.addSuffix) {
    if (options.comparison > 0) {
      return `in ${result}`;
    } else {
      return `${result} ago`;
    }
  }

  return result;
};
const formatDistance = (
  token: string,
  count: string,
  _options: any,
): string => {
  return FormatDistanceLocale[token].replace("{{count}}", count);
};

// very heavily borrowed/taken from:
// https://github.com/date-fns/date-fns/issues/1706#issuecomment-836601089
export const timeAgo = (dateStr = ""): string => {
  return formatDistanceToNowStrict(new Date(dateStr), {
    addSuffix: true,
    locale: {
      ...locale,
      formatDistance: formatDistanceAgo,
    },
  });
};

export const timeBetween = ({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}): string => {
  return formatDistanceStrict(new Date(startDate), new Date(endDate), {
    addSuffix: true,
    locale: {
      ...locale,
      formatDistance,
    },
  });
};

export const formatDateToUTC = (dateStr = "") => {
  return new Date(dateStr).toISOString();
};

const isoToDate = (dateStr = "") => {
  return parseISO(dateStr);
};

export const prettyEnglishDate = (dateStr = "") => {
  return format(isoToDate(dateStr), "MMM dd, yyyy");
};

export const prettyUTCTime = (dateStr = "") => {
  return format(isoToDate(dateStr), "yyyy-MM-dd HH:mm:ss 'UTC'x");
};

export const prettyEnglishDateWithTime = (dateStr = "") => {
  return format(isoToDate(dateStr), "MMM dd, yyyy 'at' hh:mm a (z)");
};

export const prettyDateTime = (dateStr = "") => {
  return format(isoToDate(dateStr), "yyyy-MM-dd hh:mm:ss aaa (z)");
};

export const prettyDateTimeForBackups = (dateStr = "") => {
  return format(isoToDate(dateStr), "yyyy-MM-dd-hh-mm-ss");
};

export const prettyDate = (dateStr = "") => {
  return format(isoToDate(dateStr), "yyyy-MM-dd");
};

export const prettyDateRelative = (dateStr = "") => {
  return formatRelative(isoToDate(dateStr), new Date());
};

export const dateFromToday = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};

export const secondsFromNow = (seconds: number) => {
  const d = new Date();
  return new Date(d.getTime() + seconds * 1000);
};
