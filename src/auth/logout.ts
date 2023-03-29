import { select } from "saga-query";

import { authApi } from "@app/api";
import { resetToken, selectToken } from "@app/token";
import { Token } from "@app/types";

export const logout = authApi.delete(
  "/tokens/:tokenId",
  function* onLogout(ctx, next) {
    const token: Token = yield select(selectToken);
    ctx.request = ctx.req({
      url: `/tokens/${token.tokenId}`,
      method: "DELETE",
    });

    yield next();

    ctx.actions.push(resetToken());
  },
);
