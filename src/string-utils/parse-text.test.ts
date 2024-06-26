// @vitest-environment: node

import { type TextVal, parseText } from ".";

function defaultTextVal(key: string, value: string): TextVal {
  return {
    key,
    value,
    meta: {},
  };
}

describe("parseText", () => {
  describe("each line is a separate key=value pair", () => {
    describe("basic value", () => {
      it("should parse properly", () => {
        const input = `DEBUG=true
        WOW=very nice
        SOMETHING="do you even?"
        NO=1`;

        const actual = parseText(input, () => ({}));
        expect(actual).toEqual([
          defaultTextVal("DEBUG", "true"),
          defaultTextVal("WOW", "very nice"),
          defaultTextVal("SOMETHING", "do you even?"),
          defaultTextVal("NO", "1"),
        ]);
      });
    });

    describe("value that contains an `=`", () => {
      it("should parse properly", () => {
        const input = `DEBUG=true
        WOW=very=nice
        SANDWICH=ok`;

        const actual = parseText(input, () => ({}));
        expect(actual).toEqual([
          defaultTextVal("DEBUG", "true"),
          defaultTextVal("WOW", "very=nice"),
          defaultTextVal("SANDWICH", "ok"),
        ]);
      });
    });

    describe("text contains a bunch of newlines", () => {
      it("should parse properly", () => {
        const input = `DEBUG=true


        WOW=very=nice


        SANDWICH=ok

`;

        const actual = parseText(input, () => ({}));
        expect(actual).toEqual([
          defaultTextVal("DEBUG", "true"),
          defaultTextVal("WOW", "very=nice"),
          defaultTextVal("SANDWICH", "ok"),
        ]);
      });
    });
  });

  describe("multiline value for one key", () => {
    it("should parse properly", () => {
      const input = `DEBUG=true
        MULTI="This is a multiline
comment. I can keep
going and it should work"
        SANDWICH=ok`;

      const actual = parseText(input, () => ({}));
      expect(actual).toEqual([
        defaultTextVal("DEBUG", "true"),
        defaultTextVal(
          "MULTI",
          "This is a multiline\ncomment. I can keep\ngoing and it should work",
        ),
        defaultTextVal("SANDWICH", "ok"),
      ]);
    });
  });
});
