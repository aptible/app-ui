import { createLog } from "@app/debug";
const log = createLog("tuna");

export function tunaEvent(event: string, data: any = null) {
  log(event, data);

  if (import.meta.env.VITE_TUNA_ENABLED === "true") {
    const w = window as any;
    if (typeof w === "undefined") return;
    if (!w.aptible) return;
    if (typeof w.aptible.event !== "function") return;
    w.aptible.event(event, data);
  }
}

export function tunaIdentify(email: string) {
  log("identify", email);

  if (import.meta.env.VITE_TUNA_ENABLED === "true") {
    const w = window as any;
    if (typeof w === "undefined") return;
    if (!w.aptible) return;
    if (typeof w.aptible.event !== "function") return;
    w.aptible.identify(email);
  }
}
