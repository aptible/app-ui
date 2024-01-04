import { defaultEntity } from "@app/hal";
import { db } from "@app/schema";
import { deserializeUser } from "./serializers";

export * from "./serializers";
export * from "./selectors";
export * from "./types";
export * from "./effects";

export const entities = {
  user: defaultEntity({
    id: "user",
    save: db.users.add,
    deserialize: deserializeUser,
  }),
};
