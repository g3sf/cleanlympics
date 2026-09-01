# Cleanlympics Electron Staff Beta 0.3.3

Standalone Windows desktop application for Cleanlympics staff checklists and administration.

## Architecture

The packaged application does not run a web server, open a browser port, or require a network connection. The React renderer calls a restricted Electron preload API, which sends requests over Electron IPC to an in-process router. The router reads and writes a local SQLite database under Electron's per-user application-data folder.

Vite uses a localhost development server only while running `npm run dev`. Production installers load the compiled interface directly from `dist/index.html`.

## Development

1. Install Node.js 22.
2. Run `npm ci` from this folder.
3. Run `npm test`.
4. Run `npm run dev`.

No server configuration or `.env` file is required.

## Build Windows installers

- `npm run dist:win` builds the NSIS `.exe` installer.
- `npm run dist:msix` builds the MSIX/AppX package.

Outputs appear under `apps/desktop/release`. Installer signing requires a suitable Windows code-signing certificate; certificates and generated installers are intentionally excluded from Git.

## Local data

Each Windows user gets a private `cleanlympics.sqlite` database on first launch. Operational databases are never committed or bundled into the installer. Back up and migrate an existing database separately when upgrading a machine.

Initial administrator login for a new database: `admin` / `Password123!`. Change it before staff use.

See `docs/STANDALONE-REFACTOR-PROGRESS.md` for the current validation and packaging status.
