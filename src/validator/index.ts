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
