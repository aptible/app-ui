import { DateTime } from "luxon";

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

const isoToDate = (dateStr = "") => {
  return DateTime.fromISO(dateStr);
};

export const prettyEnglishDate = (dateStr = "") => {
  return isoToDate(dateStr).toFormat("MMM dd, yyyy");
};

export const prettyUTCTime = (dateStr = "") => {
  const clipped = new Date(dateStr)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
  return `${clipped} UTC`;
};

export const prettyDateTime = (dateStr = "") => {
  return isoToDate(dateStr).toFormat("yyyy-MM-dd hh:mm:ss aaa (z)");
};

export const prettyDateTimeForBackups = (dateStr = "") => {
  return isoToDate(dateStr).toFormat("yyyy-MM-dd-hh-mm-ss");
};

export const prettyDate = (dateStr = "") => {
  return isoToDate(dateStr).toFormat("yyyy-MM-dd");
};

export const prettyDateRelative = (dateStr = "") => {
  return isoToDate(dateStr).toRelative();
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
