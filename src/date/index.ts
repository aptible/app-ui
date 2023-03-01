import { format, formatDistanceToNowStrict, formatRelative } from "date-fns";
import locale from "date-fns/locale/en-US";

const FormatDistanceLocale: { [key: string]: string } = {
  lessThanXSeconds: "{{count}}s",
  xSeconds: "{{count}}s",
  halfAMinute: "30s",
  lessThanXMinutes: "{{count}}m",
  xMinutes: "{{count}}m",
  aboutXHours: "{{count}}h",
  xHours: "{{count}}h",
  xDays: "{{count}}d",
  aboutXWeeks: "{{count}}w",
  xWeeks: "{{count}}w",
  aboutXMonths: "{{count}}m",
  xMonths: "{{count}}m",
  aboutXYears: "{{count}}y",
  xYears: "{{count}}y",
  overXYears: "{{count}}y",
  almostXYears: "{{count}}y",
};

const formatDistance = (token: string, count: string, options: any): string => {
  options = options || {};

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

// very heavily borrowed/taken from:
// https://github.com/date-fns/date-fns/issues/1706#issuecomment-836601089
export const timeAgo = (dateStr: string = ""): string => {
  return formatDistanceToNowStrict(new Date(dateStr), {
    addSuffix: true,
    locale: {
      ...locale,
      formatDistance,
    },
  });
};

export const prettyEnglishDate = (dateStr: string = "") => {
  return format(new Date(dateStr), "MMM dd, yyyy");
};

export const prettyDateTime = (dateStr: string = "") => {
  return format(new Date(dateStr), "yyyy-MM-dd hh:mm:ss aaa");
};

export const prettyDate = (dateStr: string = "") => {
  return format(new Date(dateStr), "yyyy-MM-dd");
};

export const prettyDateRelative = (dateStr: string = "") => {
  return formatRelative(new Date(dateStr), new Date());
};
