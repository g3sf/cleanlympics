# Standalone Electron refactor progress

Updated: 2026-08-31

## Completed

- Refactored the desktop application from `fetch` calls to an Express service on port 4317 into a packaged, in-process Electron architecture.
- Added a context-isolated preload bridge and `ipcMain` request handler.
- Embedded the API routing, scoring, catalog, and SQLite access code in the desktop package.
- Production windows load `dist/index.html` directly. No HTTP listener, browser port, or external server process is used by the packaged app.
- Moved the live database location to Electron's per-user application-data directory.
- Removed the operational database from installer resources and source control. A fresh installation creates and seeds its database locally.
- Aligned the runtime with the previously working standalone 0.2.5 build: Electron 44.0.0 and `better-sqlite3` 13.0.3.
- Updated the desktop version to `0.3.3-staff-beta`.
- Added internal packaged smoke/capture modes and a repeatable embedded API test.
- Removed server startup and `.env` setup from the root development scripts.

The former `apps/server` project and server deployment material remain in the repository only as legacy migration/reference material. They are not started by the root scripts and are not included in the desktop package.

## Validation completed

- Scoring unit tests: 3 passed.
- Embedded IPC/API test against a newly created database: passed.
- New database seed: 13 teams, 13 standings rows, and no demo submissions.
- Vite production build: passed.
- Packaged health smoke test: passed during refactor validation.
- Process inspection of the packaged application: zero listening TCP ports.
- The source database selected for this machine's upgrade was checked separately and contained 38 backlog submissions. It is intentionally not in Git.

## Packaging and machine upgrade still to finish

- Complete the final packaged UI capture check on this Windows host.
- Build final NSIS and MSIX artifacts from this commit.
- Sign the packages with the local Cleanlympics certificate.
- Back up and migrate the existing 38-submission database into the installed app's per-user data directory.
- Install the signed package and perform a final launch/login/data check.

## Host-specific note

Electron GPU subprocesses failed with Windows status `0xC0000135` when launched inside the restricted Codex execution environment. The current main process uses software/in-process rendering switches so automated packaging checks can proceed. The final installed build must be visually smoke-tested in the normal interactive Windows session before release.
