import { db } from "@app/schema";

export const selectTheme = db.theme.select;
