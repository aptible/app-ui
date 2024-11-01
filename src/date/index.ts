// https://moment.github.io/luxon/#/formatting?id=table-of-tokens
import { DateTime } from "luxon";

export const isoToDate = (dateStr = "") => {
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
  return end.toRelative({ base: start }) || "";
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

export function findLatestDate<M extends { createdAt: string }>(a: M, b: M) {
  const aDate = new Date(a.createdAt).getTime();
  const bDate = new Date(b.createdAt).getTime();
  return aDate > bDate ? a : b;
}
