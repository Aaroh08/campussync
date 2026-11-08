# CampusSync

**Offline campus collaboration.** A working local application built with AI assistance, with source code, repeatable tests and documented engineering tradeoffs.

## What it does

Shared notebook; independent task records with completion and tombstones; local IndexedDB persistence; cached application shell; automatic synchronization; task filtering; Markdown and JSON exports.

## Run it

Requires Node.js 24.13.1 or newer and npm. Initial installation requires internet. No GPU, paid account or API key is required.

```sh
git clone https://github.com/Aaroh08/campussync.git
cd campussync
npm ci
npm run build
npm test
npm start
```

Open **http://127.0.0.1:5072**. On Windows you can also run `start.ps1` after `npm ci`. Keep the terminal open. Ctrl+C stops the application. Database files are created in ignored `data/`. Stop the server before copying the entire data directory for a local backup; protect both database backups and invite links.

Create a club workspace, write notes and add tasks. Open the same invite in another browser profile. Disconnect a client after first loading the app, edit both copies, and reconnect. Independent task IDs and concurrent text edits converge.

## Architecture

```mermaid
flowchart LR
 Browser[Browser UI] --> Local[IndexedDB CRDT updates]
 Browser -->|Bearer capability / HTTP sync| API[Express API]
 API --> DB[(SQLite WAL)]
 API --> History[Bounded checkpoint history]
```

Y.Text merges text changes. Each task is a Y.Map nested under a unique task ID; concurrent edits to the same field resolve deterministically according to Yjs, not human intent or wall-clock time. Deleted tasks use tombstones. IndexedDB persists CRDT updates, and a service worker caches only application assets. Server API responses and invite tokens are not stored in the service worker cache.

The shared document syncs every 1.5 seconds. Updates merge server-side with Yjs and persist in a transaction together with a checkpoint. Retrying an unchanged update is idempotent. The latest 100 checkpoints are retained per workspace; current document state is limited to 1 MB. This single-process design favors maintainability and demonstration over horizontal scaling.

## Verification

`npm run check` rebuilds the browser bundle and runs the Node test suite. Tests use real HTTP servers, SQLite, authentication middleware and CRDT updates. See [recorded test output](artifacts/verification.txt). GitHub Actions repeats the build and tests on Linux/Node 24. Tests cover access isolation, cross-origin rejection, malformed sync updates, idempotent retries, invite rotation, database restart recovery and ten independently edited clients.

See [verification notes](docs/VERIFICATION.md) for completed browser checks and their limits. A passing test suite is evidence for the cases exercised, not a promise of zero defects.

## Access and privacy

Workspaces use random 256-bit bearer capabilities. Only a SHA256 token hash is stored server-side. The browser keeps the invite in local storage and the URL fragment. Anyone with the invite has full workspace access, including key rotation. Replace the invite key to revoke old server access; this cannot erase copies already downloaded by collaborators. There are no user accounts, role-based permissions or account recovery.

No analytics or remote AI calls are implemented. Code, notes and document contents are stored locally in SQLite and browser storage as applicable. Do not treat this as an encrypted vault. Use fictional content for public demos. All SQL values use bound parameters, and rendered source passages are escaped.

## Scope and production readiness

Browser storage can be cleared or evicted. Offline operation requires an initial online visit and a retained invite. This is not end-to-end encrypted storage. There are no attachments, calendar integrations, push notifications or per-member roles. The server currently binds to localhost, so testing from another physical device requires a separately configured secure deployment.

This is a tested portfolio application, **not a certified production service**. Before an internet deployment, add named-user authentication and authorization, TLS, deployment-specific origin/host controls, stronger per-user quotas, backup/restore drills, security review, monitoring, privacy/retention controls and realistic load testing. Node's built-in SQLite API is experimental in the tested runtime. No availability SLA, penetration-test certification or production-scale performance claim is made.

## Repository guide

- `src/server.mjs`: project API and entry point.
- `src/core.mjs`: persistent workspaces, access control and sync protocol.
- `src/client.js`: project-specific UI.
- `src/shared.js`: local persistence and synchronization.
- `tests/`: reproducible integration and regression tests.
- [Architecture and operations](docs/ENGINEERING.md)
- [Demo and interview guide](docs/DEMO.md)
- [Security model](SECURITY.md)

## References

- [Yjs shared data and persistence](https://docs.yjs.dev/)
- [Node SQLite API](https://nodejs.org/download/release/latest-v24.x/docs/api/sqlite.html)
- [QuickJS WebAssembly bindings](https://github.com/justjake/quickjs-emscripten) (CodeRoom)
- [Mozilla PDF.js](https://github.com/mozilla/pdf.js) (EvidenceDesk)
