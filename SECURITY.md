# Security model

CampusSync runs on loopback by default. Public GitHub source code is not a public application deployment.

Trust boundaries: browser capability possession, HTTP API, database, and project-specific workers. Capabilities are shared editing credentials, not user identities. A member can copy data or rotate access. Browser local storage is accessible to scripts on the same origin; XSS would compromise the invite. CSP, escaped rendering and no external scripts reduce this risk but do not prove its absence.

Y.Text merges text changes. Each task is a Y.Map nested under a unique task ID; concurrent edits to the same field resolve deterministically according to Yjs, not human intent or wall-clock time. Deleted tasks use tombstones. IndexedDB persists CRDT updates, and a service worker caches only application assets. Server API responses and invite tokens are not stored in the service worker cache.

The API rejects foreign Origin headers, bounds JSON bodies and collaboration state, and rate-limits 600 API requests per minute per socket address. The limiter is in memory and resets on restart; behind a proxy, configure identity and trusted forwarding deliberately. Workspace creation has no account quota, so the server must not be exposed unchanged. No TLS, central audit trail, encryption at rest or automatic retention policy is provided.

Report suspected vulnerabilities through GitHub private vulnerability reporting if enabled; do not include live invite links or private documents in public issues. Treat dependencies and parser/interpreter boundaries as attack surfaces. Review package-lock changes and run npm audit before deployment.
