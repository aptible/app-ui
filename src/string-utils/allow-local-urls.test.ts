// @vitest-environment: node

import { allowLocalUrls } from "./index";

describe("allowLocalUrls", () => {
  it("should allow local urls", () => {
    expect(allowLocalUrls("/settings/security")).toBe(true);
    expect(allowLocalUrls("/")).toBe(true);
    expect(allowLocalUrls("/apps")).toBe(true);
  });

  it("should reject remote urls", () => {
    expect(allowLocalUrls("//aptible.com")).toBe(false);
    expect(allowLocalUrls("https://aptible.com")).toBe(false);
  });

  it("should reject remote urls without protocol", () => {
    expect(allowLocalUrls("aptible.com")).toBe(false);
  });
});
