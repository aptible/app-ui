import { testSecret } from ".";

describe("testSecret", () => {
  it("should detect secrets with a generic pattern when assignment context is provided", () => {
    const secret = "abcdefghijklmnopqrst-_0123456789";

    const withoutAssign = testSecret(secret);
    const withAssign = testSecret(`adaFruit = "${secret}"`);

    expect(withoutAssign).toBe(false);
    expect(withAssign).toBe(true);
  });

  it("should detect secrets with a specific pattern without assignment", () => {
    const secret =
      "github_pat_82_chars_required_0123456789_abcdefghijklmnopqrstuvwxyz_ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const withoutAssign = testSecret(secret);
    const withAssign = testSecret(`my_PAT = '${secret}'`);

    expect(withoutAssign).toBe(true);
    expect(withAssign).toBe(true);
  });

  it("should test the entire list of regexes", () => {
    const actual = testSecret(
      "zendesk=0123456789abcdefghijklmnopqrstuvwxyzABCD",
    );
    expect(actual).toBe(true);
  });
});
