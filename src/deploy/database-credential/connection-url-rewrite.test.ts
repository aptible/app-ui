// @vitest-environment: node
import { connectionUrlRewrite } from ".";

describe("connectionUrlRewrite", () => {
  it("should return original connection url if not external host found", () => {
    const orig = "postgresql://user:0passvOQ-ALL3UMEsTQk9jwow@host:1234/db";
    const actual = connectionUrlRewrite(orig, "", [[1234, 5432]]);

    expect(actual).toEqual(orig);
  });

  it("should return original connection url if no port mapping found", () => {
    const orig = "postgresql://user:0passvOQ-ALL3UMEsTQk9jwow@host:2222/db";
    const actual = connectionUrlRewrite(
      orig,
      "elb-aptible-us-nowhere-1-12345.aptible.in",
      [[1234, 5432]],
    );

    expect(actual).toEqual(orig);
  });

  it("should replace original connection url", () => {
    const orig = "postgresql://user:0passvOQ-ALL3UMEsTQk9jwow@host:1234/db";
    const actual = connectionUrlRewrite(
      orig,
      "elb-aptible-us-nowhere-1-12345.aptible.in",
      [[1234, 5432]],
    );

    const expected =
      "postgresql://user:0passvOQ-ALL3UMEsTQk9jwow@elb-aptible-us-nowhere-1-12345.aptible.in:5432/db";
    expect(actual).toEqual(expected);
  });
});
