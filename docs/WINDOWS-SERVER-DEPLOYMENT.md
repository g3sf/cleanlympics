# Cleanlympics Windows Server deployment

## Architecture

- Staff computers install `Cleanlympics Setup.exe`.
- Electron connects over HTTP/HTTPS to one Windows Server.
- The server runs the Node.js API as a Windows service.
- SQLite exists only at `C:\CleanlympicsServer\data\cleanlympics.sqlite`.
- Clients never open the database directly. Do not place the database on a network share.

## Server prerequisites

1. Windows Server 2019, 2022 or 2025.
2. Node.js 22 LTS (x64).
3. NSSM or another Windows service manager.
4. A fixed server name or IP.
5. For production, IIS with HTTPS, URL Rewrite and Application Request Routing.

## Installation

1. Copy the `apps/server` and `deployment` folders to the server.
2. Open PowerShell as Administrator and run `deployment\install-server.ps1`.
3. Edit `C:\CleanlympicsServer\.env`; replace `ADMIN_PASSWORD` and `JWT_SECRET`.
4. Register the service:

   `nssm install CleanlympicsServer "C:\Program Files\nodejs\node.exe" "C:\CleanlympicsServer\src\index.js"`

5. Set its startup directory to `C:\CleanlympicsServer`, start it, and test `http://SERVER-NAME:4317/api/health`.
6. Before use outside a protected LAN, configure IIS HTTPS and proxy `/api` to `http://127.0.0.1:4317`.

## Desktop installer

1. Build on Windows 10/11 with `npm run dist:win`.
2. The installer is written to `apps\desktop\release`.
3. It creates the mop-torch desktop and Start menu shortcuts.
4. In Settings, enter `https://cleanlympics.your-domain.local` or, for an isolated LAN test, `http://SERVER-NAME:4317`.

## Backups

Schedule `deployment\backup-cleanlympics.ps1` nightly in Windows Task Scheduler. Keep a second encrypted copy outside the server and test restoration before launch.

## Production recommendations

- Use HTTPS and unique user accounts.
- Keep Windows Server and Node.js patched.
- Restrict port 4317 to localhost after IIS is proxying it.
- Keep SQLite on the server's local NTFS volume.
- If write volume grows substantially, migrate the server database to PostgreSQL without replacing the Electron client.
