import { extractResourceNameFromLink, extractIdFromLink } from "./index";

describe("extractIdFromLink", () => {
  it("should safely handle null values", () => {
    const actual = extractIdFromLink(null);
    expect(actual).toEqual("");
  });

  it("should safely handle when there is a malformed url", () => {
    const actual = extractIdFromLink({
      href: "/wow",
    });
    expect(actual).toEqual("wow");
  });

  it("should safely handle when there is a malformed url with no `/`", () => {
    const actual = extractIdFromLink({
      href: "wow",
    });
    expect(actual).toEqual("wow");
  });

  it("should extract resource name from url", () => {
    const actual = extractIdFromLink({
      href: "https://api.aptible.com/apps/123",
    });
    expect(actual).toEqual("123");
  });
});

describe("extractResourceNameFromLink", () => {
  it("should safely handle null values", () => {
    const actual = extractResourceNameFromLink(null);
    expect(actual).toEqual("");
  });

  it("should safely handle when there is a malformed url", () => {
    const actual = extractResourceNameFromLink({
      href: "/wow",
    });
    expect(actual).toEqual("");
  });

  it("should safely handle when there is a malformed url with no `/`", () => {
    const actual = extractIdFromLink({
      href: "wow",
    });
    expect(actual).toEqual("wow");
  });

  it("should extract resource name from url", () => {
    const actual = extractResourceNameFromLink({
      href: "https://api.aptible.com/apps/123",
    });
    expect(actual).toEqual("apps");
  });
});
