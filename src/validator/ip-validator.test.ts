import { ipValidator } from ".";

describe("ipValidator", () => {
  it("should support IPv4", () => {
    const inp = ["192.168.1.255", "127.0.0.1"];
    expect(ipValidator(inp)).toEqual(undefined);
  });

  it("should support IPv4", () => {
    const inp = ["192.168.0.15/24", "192.168.0.0/23"];
    expect(ipValidator(inp)).toEqual(undefined);
  });

  it("should reject invalid IPv4 addresses", () => {
    const inp = ["1920.168.0.15", "192.168.0.0.10"];
    expect(ipValidator(inp)).toEqual(
      "[1920.168.0.15] is not a valid IPv4 address or CIDR, [192.168.0.0.10] is not a valid IPv4 address or CIDR",
    );
  });

  it("should reject invalid IPv4 CIDR addresses", () => {
    const inp = ["192.168.0.0/40", "192.168.0.0.10/0"];
    expect(ipValidator(inp)).toEqual(
      "[192.168.0.0/40] is not a valid IPv4 address or CIDR, [192.168.0.0.10/0] is not a valid IPv4 address or CIDR",
    );
  });
});
