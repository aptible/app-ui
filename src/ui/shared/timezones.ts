import { DateTime } from "luxon";
import type { SelectOption } from "./select";

// Create a list of common IANA timezone names - keeping this for other parts of the
// application that might still need full timezone list
const timezoneNames = [
  "Africa/Cairo",
  "Africa/Johannesburg",
  "Africa/Lagos",
  "America/Anchorage",
  "America/Bogota",
  "America/Chicago",
  "America/Denver",
  "America/Halifax",
  "America/Lima",
  "America/Los_Angeles",
  "America/Mexico_City",
  "America/New_York",
  "America/Phoenix",
  "America/Santiago",
  "America/Santo_Domingo",
  "America/Sao_Paulo",
  "America/St_Johns",
  "America/Toronto",
  "America/Vancouver",
  "Asia/Bangkok",
  "Asia/Dubai",
  "Asia/Ho_Chi_Minh",
  "Asia/Hong_Kong",
  "Asia/Jakarta",
  "Asia/Jerusalem",
  "Asia/Kabul",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Manila",
  "Asia/Seoul",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Asia/Taipei",
  "Asia/Tehran",
  "Asia/Tokyo",
  "Atlantic/Reykjavik",
  "Australia/Adelaide",
  "Australia/Brisbane",
  "Australia/Melbourne",
  "Australia/Perth",
  "Australia/Sydney",
  "Europe/Amsterdam",
  "Europe/Athens",
  "Europe/Belgrade",
  "Europe/Berlin",
  "Europe/Brussels",
  "Europe/Copenhagen",
  "Europe/Dublin",
  "Europe/Helsinki",
  "Europe/Istanbul",
  "Europe/Lisbon",
  "Europe/London",
  "Europe/Madrid",
  "Europe/Moscow",
  "Europe/Oslo",
  "Europe/Paris",
  "Europe/Prague",
  "Europe/Rome",
  "Europe/Stockholm",
  "Europe/Vienna",
  "Europe/Warsaw",
  "Europe/Zurich",
  "Pacific/Auckland",
  "Pacific/Fiji",
  "Pacific/Honolulu",
  "Pacific/Tahiti",
  "UTC",
];

// Function to generate timezone option with offset information
export const getTimezoneOptions = (): SelectOption[] => {
  const now = DateTime.now();

  return timezoneNames
    .map((zoneName) => {
      const dt = now.setZone(zoneName);
      if (!dt.isValid) return null;

      const offset = dt.toFormat("ZZ");
      const label = `(UTC${offset}) ${zoneName.replace("_", " ")}`;

      return {
        value: zoneName,
        label,
        key: zoneName,
      };
    })
    .filter(Boolean) as SelectOption[];
};

// Function to generate limited timezone options (only Local and UTC)
export const getLimitedTimezoneOptions = (): SelectOption[] => {
  const localTimezone = getCurrentTimezone();
  const now = DateTime.now();
  const localDt = now.setZone(localTimezone);
  const localOffset = localDt.toFormat("ZZ");

  return [
    {
      value: "local",
      label: `Local (${localTimezone}) (UTC${localOffset})`,
      key: "local",
    },
    {
      value: "utc",
      label: "UTC",
      key: "utc",
    },
  ];
};

// Get the current timezone
export const getCurrentTimezone = (): string => {
  return DateTime.local().zoneName;
};

// Format the timezone for display
export const formatTimezone = (timezone: string): string => {
  const dt = DateTime.now().setZone(timezone);
  if (!dt.isValid) return timezone;

  return `${timezone} (UTC${dt.toFormat("ZZ")})`;
};
