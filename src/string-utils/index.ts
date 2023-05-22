const VALID_HANDLE_REGEX = /^[0-9a-z._-]{1,64}$/;
const VALID_EMAIL_REGEX =
  /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

export function validEmail(email: string): boolean {
  return !!email && !!email.toLowerCase().match(VALID_EMAIL_REGEX);
}

// this mirrors handle validation on backend
export const validHandle = (handle: string): boolean =>
  !!handle && !!handle.match(VALID_HANDLE_REGEX);

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
