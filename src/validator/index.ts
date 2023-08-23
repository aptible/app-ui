const MAX_IPV4_LENGTH = 15;
const IP_WHITELIST_MAX_SIZE = 25;
// inlined from: https://github.com/sindresorhus/ip-regex/blob/main/index.js
const v4 =
  "(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}";
const v4exact = new RegExp(`^${v4}$`);

function isIPv4(ip: string) {
  return v4exact.test(ip.slice(0, MAX_IPV4_LENGTH));
}

export function ipValidator(ips: string[]) {
  const errs: string[] = [];
  if (ips.length > IP_WHITELIST_MAX_SIZE) {
    errs.push(
      `${ips.length} is greater than the max IP Allowlist size of ${IP_WHITELIST_MAX_SIZE}`,
    );
  }

  ips.forEach((ip) => {
    if (isIPv4(ip)) return;
    errs.push(`${ip} is not a valid IPv4 address`);
  });

  if (errs.length === 0) return;
  return errs.join(", ");
}

export function portValidator(port = "") {
  if (!port) return;
  const msg = "Port must be a number between 1 and 65535";
  const portNum = parseInt(port, 10);
  if (isNaN(portNum)) return msg;
  if (portNum <= 0) return msg;
  if (portNum >= 65535) return msg;
}

const handleRegexExplainer =
  "lowercase alphanumerics, periods, dashes, underscores, and less than 64 characters";
export const handleRegex = new RegExp(/^[0-9a-z._-]{1,64}$/);
export function handleValidator(handle = "") {
  if (handle === "") return `Must provide a handle ${handleRegexExplainer}`;
  const maxCharLength = 64;
  if (handle.length > maxCharLength) {
    const delta = handle.length - maxCharLength;
    return `[${handle}] is ${delta} characters too long (max: ${maxCharLength})`;
  }

  if (!handleRegex.test(handle)) {
    return `[${handle}] is not a valid handle ${handleRegexExplainer}`;
  }
}

const COMPLEXITY_RULES: [string, RegExp][] = [
  ["must be at least 10 characters", /^.{0,9}$/],
  ["must be shorter than 128 characters", /^.{128,}$/],
  ["must contain at least one uppercase letter", /^[^A-Z]+$/],
  ["must contain at least one lowercase letter", /^[^a-z]+$/],
  [
    "must contain at least one digit or special character",
    /^[^0-9!@#$%^&*()]+$/,
  ],
];

export function passValidator(password: string) {
  const errors: string[] = [];

  COMPLEXITY_RULES.forEach((rule) => {
    const [message, regex] = rule;

    if (password.match(regex)) {
      errors.push(message);
    }
  });

  return errors.join(", ");
}

const VALID_EMAIL_REGEX =
  /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

export function emailValidator(email: string) {
  if (email === "") return "Email must not be empty";
  if (!email.toLowerCase().match(VALID_EMAIL_REGEX))
    return "Must provide valid email";
}

export function existValidtor(val: string, name: string) {
  if (val === "") return `${name} must not be empty`;
}
