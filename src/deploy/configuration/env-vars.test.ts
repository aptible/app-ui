import { TextVal } from "@app/string-utils";
import { DeployAppConfigEnv } from "@app/types";
import {
  configEnvListToEnv,
  configEnvToStr,
  configStrToEnvList,
} from "./index";

function defaultTextVal(key: string, value: string): TextVal {
  return {
    key,
    value,
    meta: {},
  };
}

function symmertic(expected: DeployAppConfigEnv): DeployAppConfigEnv {
  const str = configEnvToStr(expected);
  const envList = configStrToEnvList(str);
  const actual = configEnvListToEnv({}, envList);
  return actual;
}

describe("symmetric", () => {
  it("should match expectations", () => {
    const expected = {
      ONE: "ONE",
      MULTI: "A multiline\nstring to test\nwhat happens",
      JSON: JSON.stringify({
        app: "nice",
        num: 1,
        bool: true,
        arr: ["1", "2"],
      }),
      ESCNEWLINE: "escaped-newline\\n",
    };
    const actual = symmertic(expected);
    expect(actual).toEqual(expected);
  });
});

describe("configEnvToStr", () => {
  describe("basic", () => {
    it("should match expectations", () => {
      const envObj: DeployAppConfigEnv = {
        ONE: "one",
        TWO: "some string",
        MULTI: "A multiline\nstring to test\nwhat happens",
        ZETA: "true",
        WRAPPED: '"what happens now?"',
      };
      const expected = `MULTI="A multiline
string to test
what happens"
ONE=one
TWO=some string
WRAPPED="what happens now?"
ZETA=true`;
      const actual = configEnvToStr(envObj);
      expect(actual).toEqual(expected);
    });
  });
});

describe("configStrToEnvList", () => {
  describe("each line is a separate key=value pair", () => {
    describe("basic value", () => {
      it("should parse properly", () => {
        const input = `DEBUG=true
        WOW=very nice
        SOMETHING="do you even?"
        NO=1`;

        const actual = configStrToEnvList(input);
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

        const actual = configStrToEnvList(input);
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

        const actual = configStrToEnvList(input);
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

      const actual = configStrToEnvList(input);
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
