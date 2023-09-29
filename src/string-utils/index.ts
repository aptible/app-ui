export const capitalize = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const titleize = (s: string) => {
  return s.replace(/\w\S*/g, (txt: string) => {
    return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
  });
};

export const humanize = (str: any) => {
  if (!str) {
    return "";
  }
  return str
    .replace(/^[\s_]+|[\s_]+$/g, "")
    .replace(/[_\s]+/g, " ")
    .replace(/^[a-z]/, (m: any) => {
      return m.toUpperCase();
    });
};

export const sanitizeInput = (input: string): string => input.trim();

export const titleCase = (input: string) => {
  return input
    .replace(/([^A-Z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/(^\w|\b\w)/g, (m) => {
      return m.toUpperCase();
    })
    .replace(/\s+/g, " ")
    .replace(/^\s+|\s+$/, "");
};

export const stringSort = (a = "", b = "") => {
  return a.localeCompare(b, undefined, {
    sensitivity: "base",
    numeric: true,
  });
};

// https://stackoverflow.com/a/54246501/1713216
export const camelToSnakeCase = (str: string) =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

export interface TextVal<
  M extends { [key: string]: unknown } = {
    [key: string]: unknown;
  },
> {
  key: string;
  value: string;
  meta: M;
}

export interface ValidatorError {
  item: TextVal;
  message: string;
}

const trim = (t: string) => t.trim();
export const parseText = <
  M extends { [key: string]: unknown } = { [key: string]: unknown },
>(
  text: string,
  meta: () => M,
): TextVal<M>[] =>
  text
    .split("\n")
    .map(trim)
    .map((t) => {
      // sometimes the value can contain an "=" so we need to only
      // split the first "=", (e.g. SECRET_KEY=1234=)
      // https://stackoverflow.com/a/54708145
      const [key, ...values] = t.split("=").map(trim);
      const value = Array.isArray(values) ? values.join("=") : values;
      return {
        key,
        value,
        meta: meta(),
      };
    })
    .filter((t) => !!t.key);
