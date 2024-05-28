import type { TextVal } from "@app/string-utils";
import type { DeployAppConfigEnv } from "@app/types";
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
  const actual = configEnvListToEnv(envList);
  return actual;
}

describe("symmetric", () => {
  it("should match expectations", () => {
    const expected = {
      ONE: "ONE",
      MULTI: "A multiline\nstring to test\nwhat happens",
      APOSTROPHE: "It's apostrophe time",
      APOSTROPHE_WRAPPED: "It's wrapped apostrophe time",
      JSON: JSON.stringify({
        app: "nice",
        num: 1,
        bool: true,
        arr: ["1", "2"],
      }),
      ESCNEWLINE: "escaped-newline\\n",
      WRAPPED: "That is a wrap",
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

// https://github.com/motdotla/dotenv/blob/master/tests/test-parse.js
describe("dotenv basic", () => {
  const envBasic = `BASIC=basic

# previous line intentionally left blank
AFTER_LINE=after_line
EMPTY=
EMPTY_SINGLE_QUOTES=''
EMPTY_DOUBLE_QUOTES=""
SINGLE_QUOTES='single_quotes'
SINGLE_QUOTES_SPACED='    single quotes    '
DOUBLE_QUOTES="double_quotes"
DOUBLE_QUOTES_SPACED="    double quotes    "
DOUBLE_QUOTES_INSIDE_SINGLE='double "quotes" work inside single quotes'
DOUBLE_QUOTES_WITH_NO_SPACE_BRACKET="{ port: $MONGOLAB_PORT}"
SINGLE_QUOTES_INSIDE_DOUBLE="single 'quotes' work inside double quotes"
EXPAND_NEWLINES="expand\nnew\nlines"
# COMMENTS=work
EQUAL_SIGNS=equals==
RETAIN_INNER_QUOTES={"foo": "bar"}
RETAIN_INNER_QUOTES_AS_STRING='{"foo": "bar"}'
TRIM_SPACE_FROM_UNQUOTED=    some spaced out string
USERNAME=therealnerdybeast@example.tld
    SPACED_KEY = parsed`;

  it("should match expectations", () => {
    const envList = configStrToEnvList(envBasic);
    const env = configEnvListToEnv(envList);
    expect(env.BASIC).toEqual("basic");
    expect(env.AFTER_LINE).toEqual("after_line");
    expect(env.EMPTY).toEqual("");
    expect(env.EMPTY_SINGLE_QUOTES).toEqual("");
    expect(env.EMPTY_DOUBLE_QUOTES).toEqual("");
    expect(env.SINGLE_QUOTES).toEqual("single_quotes");
    expect(env.SINGLE_QUOTES_SPACED).toEqual("    single quotes    ");
    expect(env.DOUBLE_QUOTES).toEqual("double_quotes");
    expect(env.DOUBLE_QUOTES_SPACED).toEqual("    double quotes    ");
    expect(env.DOUBLE_QUOTES_INSIDE_SINGLE).toEqual(
      'double "quotes" work inside single quotes',
    );
    expect(env.DOUBLE_QUOTES_WITH_NO_SPACE_BRACKET).toEqual(
      "{ port: $MONGOLAB_PORT}",
    );
    expect(env.SINGLE_QUOTES_INSIDE_DOUBLE).toEqual(
      "single 'quotes' work inside double quotes",
    );
    expect(env.EXPAND_NEWLINES).toEqual("expand\nnew\nlines");
    expect(env.EQUAL_SIGNS).toEqual("equals==");
    expect(env.RETAIN_INNER_QUOTES).toEqual('{"foo": "bar"}');
    expect(env.RETAIN_INNER_QUOTES_AS_STRING).toEqual('{"foo": "bar"}');
    expect(env.TRIM_SPACE_FROM_UNQUOTED).toEqual("some spaced out string");
    expect(env.USERNAME).toEqual("therealnerdybeast@example.tld");
    expect(env.SPACED_KEY).toEqual("parsed");
    expect(env.EQUAL_SIGNS).toEqual("equals==");
    expect(env.RETAIN_INNER_QUOTES).toEqual('{"foo": "bar"}');
    expect(env.EQUAL_SIGNS).toEqual("equals==");
    expect(env.RETAIN_INNER_QUOTES).toEqual('{"foo": "bar"}');
    expect(env.RETAIN_INNER_QUOTES_AS_STRING).toEqual('{"foo": "bar"}');
    expect(env.TRIM_SPACE_FROM_UNQUOTED).toEqual("some spaced out string");
    expect(env.USERNAME).toEqual("therealnerdybeast@example.tld");
    expect(env.SPACED_KEY).toEqual("parsed");
  });
});

// https://github.com/motdotla/dotenv/blob/master/tests/test-parse-multiline.js
describe("dotenv multiline", () => {
  const envMultiline = `BASIC=basic

# previous line intentionally left blank
AFTER_LINE=after_line
EMPTY=
SINGLE_QUOTES='single_quotes'
SINGLE_QUOTES_SPACED='    single quotes    '
DOUBLE_QUOTES="double_quotes"
DOUBLE_QUOTES_SPACED="    double quotes    "
EXPAND_NEWLINES="expand\nnew\nlines"
# COMMENTS=work
EQUAL_SIGNS=equals==
RETAIN_INNER_QUOTES={"foo": "bar"}

RETAIN_INNER_QUOTES_AS_STRING='{"foo": "bar"}'
TRIM_SPACE_FROM_UNQUOTED=    some spaced out string
USERNAME=therealnerdybeast@example.tld
    SPACED_KEY = parsed

MULTI_DOUBLE_QUOTED="THIS
IS
A
MULTILINE
STRING"`;

  it("should match expectations", () => {
    const envList = configStrToEnvList(envMultiline);
    const env = configEnvListToEnv(envList);
    expect(env.BASIC).toEqual("basic");
    expect(env.AFTER_LINE).toEqual("after_line");
    expect(env.EMPTY).toEqual("");
    expect(env.SINGLE_QUOTES).toEqual("single_quotes");
    expect(env.SINGLE_QUOTES_SPACED).toEqual("    single quotes    ");
    expect(env.DOUBLE_QUOTES).toEqual("double_quotes");
    expect(env.DOUBLE_QUOTES_SPACED).toEqual("    double quotes    ");
    expect(env.EXPAND_NEWLINES).toEqual("expand\nnew\nlines");
    expect(env.EQUAL_SIGNS).toEqual("equals==");
    expect(env.RETAIN_INNER_QUOTES).toEqual('{"foo": "bar"}');
    expect(env.RETAIN_INNER_QUOTES_AS_STRING).toEqual('{"foo": "bar"}');
    expect(env.TRIM_SPACE_FROM_UNQUOTED).toEqual("some spaced out string");
    expect(env.USERNAME).toEqual("therealnerdybeast@example.tld");
    expect(env.SPACED_KEY).toEqual("parsed");
    expect(env.MULTI_DOUBLE_QUOTED).toEqual("THIS\nIS\nA\nMULTILINE\nSTRING");
  });
});
