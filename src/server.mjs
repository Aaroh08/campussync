import { listen } from "./runtime.mjs";
import { createApp, finish } from "./core.mjs";
export function application(options) {
  const s = createApp(options);
  finish(s);
  return s;
}
if (process.argv[1]?.endsWith("server.mjs")) {
  const s = application();
  listen(s);
}
