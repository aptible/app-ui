// @vitest-environment node
import { setupTestStore } from "@app/app/store";
import { testEnv } from "@app/mocks";
import { defaultToken } from "@app/schema";
import { revokeAllTokens } from "./token";

const sleep = (n: number) =>
  new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, n);
  });

describe("revokeAllTokens", () => {
  it("should use the elevated token", async () => {
    let elevated = false;
    let body = "";
    revokeAllTokens.use(function* (ctx) {
      elevated = ctx.elevated;
      body = ctx.request?.body as string;
      return;
    });

    const store = setupTestStore({
      env: testEnv,
      token: defaultToken({ tokenId: "1" }),
      elevatedToken: defaultToken({ tokenId: "2" }),
    });
    store.dispatch(revokeAllTokens());

    await sleep(100);

    expect(elevated).toBe(true);
    expect(JSON.parse(body)).toEqual({
      except_tokens: [
        `${testEnv.authUrl}/tokens/1`,
        `${testEnv.authUrl}/tokens/2`,
      ],
    });
  });
});
