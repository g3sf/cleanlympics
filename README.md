# Cleanlympics Electron Staff 0.3.4

Standalone Windows desktop application for Cleanlympics staff checklists and administration.

## Architecture

The packaged application does not run a web server, open a browser port, or require a network connection. The React renderer calls a restricted Electron preload API, which sends requests over Electron IPC to an in-process router. The router reads and writes a SQLite database directly in the same Electron process.

Vite uses a localhost development server only while running `npm run dev`. Production installers load the compiled interface directly from `dist/index.html`.

## Development

1. Install Node.js 22.
2. Run `npm ci` from this folder.
3. Run `npm test`.
4. Run `npm run dev`.

No server configuration or `.env` file is required.

## Build Windows installers

- `npm run dist:win` builds the NSIS `.exe` installer.
- `npm run dist:msix` builds the MSIX package.

Outputs appear under `apps/desktop/release`. Installer signing requires a suitable Windows code-signing certificate; certificates and generated installers are intentionally excluded from Git.

Build a release package with `npm run dist:msix`, then sign it with `scripts/sign-msix.ps1`. See [Windows Server MSIX installation](docs/WINDOWS-SERVER-MSIX.md) for the one-time certificate trust, installation, backup, and update procedures.

## Shared Windows Server data and upgrades

All interactive Windows users share `C:\Users\Public\Documents\Cleanlympics\data\cleanlympics.sqlite`. That location is outside the installed MSIX package, so replacing the package with a later version preserves the live data. It is writable by interactive RDP users on Windows Server's default ACL. On first launch, when that shared file does not exist, the application safely copies an existing legacy database from its prior per-user location or `C:\CleanlympicsServer\data\cleanlympics.sqlite`; it never overwrites an existing shared database.

For a different shared disk or UNC path, define a machine environment variable named `CLEANLYMPICS_DATABASE_PATH` with the full database-file path before launching the application. The account running the app needs read/write access to that path.

To upgrade, install the next signed MSIX with the same package identity and publisher certificate. Windows replaces the application package in place; do not uninstall the current package, because uninstalling an MSIX may remove package-owned settings. The SQLite database remains untouched in Public Documents in either case.

Operational databases are never committed or bundled into the installer. Back them up separately.

## First sign-in

For a new database, sign in with:

- User ID: `admin`
- Password: `Password123!`

Change this default password before staff use the application.

See `docs/STANDALONE-REFACTOR-PROGRESS.md` for the current validation and packaging status.
