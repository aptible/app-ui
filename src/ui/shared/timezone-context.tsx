import { DateTime } from "luxon";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

export type TimezoneMode = "local" | "utc" | string;

interface TimezoneContextType {
  timezone: TimezoneMode;
  setTimezone: (timezone: TimezoneMode) => void;
  formatDateTime: (dateTime: DateTime | string) => string;
  convertToDisplayTimezone: (dateTime: DateTime | string) => DateTime;
  currentTimezoneDisplay: string;
}

const defaultContext: TimezoneContextType = {
  timezone: "UTC",
  setTimezone: () => {},
  formatDateTime: () => "",
  convertToDisplayTimezone: (dt) =>
    typeof dt === "string" ? DateTime.fromISO(dt) : dt,
  currentTimezoneDisplay: "",
};

export const TimezoneContext =
  createContext<TimezoneContextType>(defaultContext);

interface TimezoneProviderProps {
  children: React.ReactNode;
}

export function TimezoneProvider({ children }: TimezoneProviderProps) {
  const [timezone, setTimezone] = useState<TimezoneMode>("UTC");
  const [currentTimezoneDisplay, setCurrentTimezoneDisplay] =
    useState<string>("");

  useEffect(() => {
    if (timezone === "local") {
      setCurrentTimezoneDisplay(DateTime.local().offsetNameShort);
    } else if (timezone === "utc") {
      setCurrentTimezoneDisplay("UTC");
    } else {
      // For IANA timezone names
      const dt = DateTime.now().setZone(timezone as string);
      setCurrentTimezoneDisplay(dt.isValid ? dt.offsetNameShort : "UTC");
    }
  }, [timezone]);

  // Convert a DateTime object to the currently selected timezone
  const convertToDisplayTimezone = (dateTime: DateTime | string): DateTime => {
    const dt =
      typeof dateTime === "string" ? DateTime.fromISO(dateTime) : dateTime;

    if (timezone === "utc") {
      return dt.toUTC();
    }
    if (timezone === "local") {
      return dt.setZone(DateTime.local().zoneName);
    }

    // Use the specified IANA timezone
    return dt.setZone(timezone);
  };

  // Format a DateTime object according to the current timezone setting
  const formatDateTime = (dateTime: DateTime | string): string => {
    const dt = convertToDisplayTimezone(dateTime);
    return dt.toFormat("yyyy-MM-dd HH:mm:ss");
  };

  return (
    <TimezoneContext.Provider
      value={{
        timezone,
        setTimezone,
        formatDateTime,
        convertToDisplayTimezone,
        currentTimezoneDisplay,
      }}
    >
      {children}
    </TimezoneContext.Provider>
  );
}

export function useTimezone(): TimezoneContextType {
  return useContext(TimezoneContext);
}
