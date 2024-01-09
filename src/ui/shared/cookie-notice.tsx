import debug from "debug";

import { useEffect, useState } from "react";
import { Button } from "./button";

const COOKIE_NAME = "cookieConsent";

const log = debug("cookie-notice");

interface CookieJar {
  [key: string]: string;
}

export const getCookie = (name: string): string | undefined => {
  return allCookies()[name];
};

export const writeCookie = (
  name: string,
  value: string,
  expiresInDays: number,
) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  let cookieString = `${name}=${value}; expires=${expiresAt.toUTCString()}; `;
  const baseDomain = window.location.hostname.split(".").slice(-2).join(".");
  cookieString += `domain=.${baseDomain}; path=/; SameSite=Lax`;

  if (!import.meta.env.PROD) {
    log("writing cookie", cookieString);
  }

  window.document.cookie = cookieString;
};

export const allCookies = (): CookieJar => {
  const cookies: CookieJar = {};
  const cookieStrings: string[] = window.document.cookie.split(";");

  for (const cookie of cookieStrings) {
    const tokens = cookie.split("=");
    if (tokens.length !== 2) {
      continue;
    }

    cookies[tokens[0].trim()] = tokens[1].trim();
  }

  return cookies;
};

export const CookieNotice = () => {
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    if (!import.meta.env.PROD) {
      return;
    }

    if (getCookie(COOKIE_NAME) === undefined) {
      setShowNotice(true);
    }
  }, []);

  const closeFn = () => {
    writeCookie(COOKIE_NAME, "1", 90);
    setShowNotice(false);
  };

  return (
    <div>
      {showNotice && (
        <div className="sm:fixed bottom-5 right-5 w-96 px-8 py-8 z-50 bg-white border border-gray-200 rounded-lg">
          <p className="text-sm">
            This site uses cookies to store information on your computer. Some
            are essential to make our site work; others help us improve the user
            experience. By using the site, you consent to the placement of these
            cookies.
          </p>

          <div className="my-5 columns-2">
            <div>
              <Button
                className="mt-2"
                size="sm"
                variant="secondary"
                onClick={closeFn}
              >
                Dismiss
              </Button>
            </div>
            <div>
              <p className="text-sm">
                Read our <br />
                <a href="https://aptible.com/legal/privacy/">
                  Privacy Statement
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
