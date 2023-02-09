import { format, formatRelative } from "date-fns";

export const prettyDateTime = (dateStr: string = "") => {
  return format(new Date(dateStr), "yyyy-MM-dd hh:mm:ss aaa");
};

export const prettyDate = (dateStr: string = "") => {
  return format(new Date(dateStr), "yyyy-MM-dd");
};

export const prettyDateRelative = (dateStr: string = "") => {
  return formatRelative(new Date(dateStr), new Date());
};
