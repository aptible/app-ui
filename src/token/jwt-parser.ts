interface JwtTokenBase {
  id: string;
  iss: string;
  sub: string;
  scope: string;
  exp: number;
  session: string | null;
  email: string;
  email_verified: boolean;
  name: string;
}

interface JwtTokenUser extends JwtTokenBase {
  _type: "user";
}

interface JwtTokenOrg extends JwtTokenBase {
  _type: "org";
  act: {
    sub: string;
    email: string;
    name: string;
  };
}

export type JwtToken = JwtTokenUser | JwtTokenOrg;

export const defaultJWTToken = (t: Partial<JwtToken> = {}): JwtToken => {
  return {
    _type: "user",
    id: "",
    iss: "",
    sub: "",
    scope: "",
    exp: 0,
    session: "",
    email: "",
    email_verified: false,
    name: "",
    ...t,
  } as JwtTokenUser;
};

export function parseJwt(token: string): JwtToken {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => {
        const str = `00${c.charCodeAt(0).toString(16)}`.slice(-2);
        return `%${str}`;
      })
      .join(""),
  );
  const jso = JSON.parse(jsonPayload);
  const sub = jso.sub || "";

  if (sub.includes("organizations") && jso.act) {
    return {
      _type: "org",
      ...jso,
    };
  }

  return {
    _type: "user",
    ...jso,
  };
}
