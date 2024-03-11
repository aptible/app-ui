// @vitest-environment: node

import { isLocalPath } from "./index";

describe("isLocalPath", () => {
  it("should allow local urls", () => {
    expect(isLocalPath("/settings/security")).toBe(true);
    expect(isLocalPath("/")).toBe(true);
    expect(isLocalPath("/apps")).toBe(true);
    expect(isLocalPath("/apps/1234")).toBe(true);
    expect(isLocalPath("/apps/1234/services")).toBe(true);
    expect(isLocalPath("/apps?query=string")).toBe(true);
  });

  it("should reject remote urls", () => {
    expect(isLocalPath("//aptible.com")).toBe(false);
    expect(isLocalPath("https://aptible.com")).toBe(false);
  });

  it("should reject remote urls without protocol", () => {
    expect(isLocalPath("aptible.com")).toBe(false);
  });
});
