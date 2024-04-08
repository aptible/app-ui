import { ReactNode } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";

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

// https://stackoverflow.com/a/6969486
export function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const stripQuote = (value: string) => {
  let str = value;
  if (str.startsWith('"') || str.startsWith("'")) {
    str = str.slice(1);
  }
  if (str.endsWith('"') || str.endsWith("'")) {
    str = str.slice(0, str.length - 1);
  }
  return str;
};

export const parseText = <
  M extends { [key: string]: unknown } = { [key: string]: unknown },
>(
  text: string,
  meta: () => M,
): TextVal<M>[] => {
  const items: TextVal<M>[] = [];

  let key = "";
  let value = "";
  // switch to place characters into the key or value "bucket"
  let collectVal = false;
  // helps us figure out if we are at the start or end of a multiline value
  let foundQuote = false;
  let foundSingleQuote = false;
  // support comments
  let waitForNewline = false;
  // submit and reset fn
  const submit = () => {
    if (key !== "") {
      items.push({
        key: key.trim(),
        value: stripQuote(value.trim()),
        meta: meta(),
      });
    }
    key = "";
    value = "";
    collectVal = false;
    foundQuote = false;
    foundSingleQuote = false;
  };

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    // ignore comments
    if (value === "" && char === "#") {
      waitForNewline = true;
    }

    if (char === "\n") {
      if (waitForNewline) {
        waitForNewline = false;
        continue;
      }
      // since we found a quote we want to include the newline in the value
      if (foundQuote || foundSingleQuote) {
        value += char;
      } else {
        // if find a newline typically that means the value is done
        submit();
      }
      continue;
    }

    if (waitForNewline) {
      continue;
    }

    if (collectVal) {
      // value has a double-quote which might be multiline
      if (char === '"') {
        // closing double-quote
        if (foundQuote) {
          value += char;
          foundQuote = false;
          continue;
        } else {
          // we found a double-quote so record it so we can detect
          // the closing quote
          foundQuote = true;
        }
      } else if (char === "'") {
        // closing single-quote
        if (foundSingleQuote) {
          value += char;
          foundSingleQuote = false;
          continue;
        } else {
          // we found a single-quote so record it so we can detect
          // the closing quote
          foundSingleQuote = true;
        }
      }
    } else {
      // we found an equal char so that marks the end of the key string
      // and the start of the value string
      if (char === "=") {
        collectVal = true;
        continue;
      }
    }

    // which bucket do we put the char into?
    if (collectVal) {
      value += char;
    } else {
      key += char;
    }
  }

  // pick up the leftovers
  submit();

  return items;
};

export const isLocalPath = (url: string): boolean => {
  if (url === "/") return true;
  return /^\/\w+/.test(url);
};

export const prettyGitSha = (shasum: string): string => {
  return shasum.slice(0, 7);
};

// Created to reuse icons as svg data strings
// https://react.dev/reference/react-dom/server/renderToString#removing-rendertostring-from-the-client-code
export const elementToString = (el: ReactNode): string => {
  const div = document.createElement('div');
  const root = createRoot(div);
  flushSync(() => root.render(el))
  return div.innerHTML
}
