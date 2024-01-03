// https://moment.github.io/luxon/#/formatting?id=table-of-tokens
import { DateTime } from "luxon";

const isoToDate = (dateStr = "") => {
  return DateTime.fromISO(dateStr, { zone: "utc" });
};

export const prettyDate = (dateStr = "") => {
  return isoToDate(dateStr).toFormat("yyyy-MM-dd");
};

export const prettyTime = (dateStr = "") => {
  return isoToDate(dateStr).toFormat("HH:mm:ss ZZZZ");
};

export const prettyDateTime = (dateStr = "") => {
  return isoToDate(dateStr).toFormat("yyyy-MM-dd HH:mm:ss ZZZZ");
};

export const fileDate = (dateStr = "") => {
  return isoToDate(dateStr).toFormat("yyyy-MM-dd");
};

export const fileDateTime = (dateStr = "") => {
  return isoToDate(dateStr).toFormat("yyyy-MM-dd-HH-mm-ss");
};

export const timeBetween = ({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}): string => {
  const start = isoToDate(startDate);
  const end = isoToDate(endDate);
  return start.toRelative({ base: end }) || "";
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

export const isBefore = (a: Date, b: Date) => a < b;
