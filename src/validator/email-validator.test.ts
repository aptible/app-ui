import { emailValidator } from ".";

// https://github.com/manishsaraan/email-validator/blob/df02ecd8f0c53041c53fac986e842df0ec935ebe/test.js
const invalid = [
  "@missing-local.org",
  "! #$%`|@invalid-characters-in-local.org",
  "(),:;`|@more-invalid-characters-in-local.org",
  "<>@[]\\`|@even-more-invalid-characters-in-local.org",
  ".local-starts-with-dot@sld.com",
  "local-ends-with-dot.@sld.com",
  "two..consecutive-dots@sld.com",
  'partially."quoted"@sld.com',
  "missing-sld@.com",
  "sld-starts-with-dashsh@-sld.com",
  "sld-ends-with-dash@sld-.com",
  'invalid-characters-in-sld@! "#$%(),/;<>_[]`|.org',
  "missing-dot-before-tld@com",
  "missing-tld@sld.",
  "invalid",
  "missing-at-sign.net",
  "trailing-dots@test.de.",
  "dot-on-dot-in-domainname@te..st.de",
  "dot-first-in-domain@.test.de",
  ".dot-start-and-end.@sil.com",
  "double@a@com",
];
const invalidTests = it.each(invalid);

describe("emailValidator", () => {
  it("should support single email", () => {
    const inp = "test@aptible.com";
    expect(emailValidator(inp)).toEqual(undefined);
  });

  invalidTests("(%s) should be rejected", (email) => {
    expect(emailValidator(email)).toEqual("Must provide valid email");
  });

  it("should not support multiple emails", () => {
    const inp = ["test@aptible.com", "test.wow@aptible.com"];
    expect(emailValidator(inp.join(", "))).toEqual("Must provide valid email");
  });
});
