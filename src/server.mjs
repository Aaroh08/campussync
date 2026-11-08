import { createApp, finish } from "./core.mjs";
export function application(options) {
  const s = createApp(options);
  finish(s);
  return s;
}
if (process.argv[1]?.endsWith("server.mjs")) {
  const s = application();
  s.app.listen(s.config.port, "127.0.0.1", () =>
    console.log("CampusSync http://127.0.0.1:" + s.config.port),
  );
}
