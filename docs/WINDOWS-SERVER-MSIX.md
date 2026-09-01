# Cleanlympics Windows Server installation

The release contains two required files:

- `Cleanlympics-<version>.msix` — the self-contained Electron application.
- `Cleanlympics-Local-CodeSigning.cer` — the public certificate used to trust the installer.

No Node.js, web server, port, database server, or other runtime is required on the Windows Server host.

## First installation

Sign in to the server as an administrator. Before installing the MSIX, trust the included certificate for the whole machine:

1. Download `Cleanlympics-Local-CodeSigning.cer` from the release and double-click it in File Explorer.
2. Select **Install Certificate…**.
3. Select **Local Machine**, then choose **Next**. Approve the Windows administrator prompt if it appears.
4. Select **Place all certificates in the following store**, then choose **Browse…**.
5. Choose **Trusted Root Certification Authorities**, select **OK**, then select **Next** and **Finish**.
6. Confirm the successful import message, then double-click `Cleanlympics-0.3.4-win-x64.msix` to install the application. Select **Install** in the Windows installer window.

The same administrator can instead perform both steps from an elevated PowerShell prompt:

```powershell
Import-Certificate -FilePath .\Cleanlympics-Local-CodeSigning.cer -CertStoreLocation Cert:\LocalMachine\Root
Add-AppxPackage -Path .\Cleanlympics-0.3.4-win-x64.msix
```

Do not install the certificate under **Current User** or **Personal**: MSIX installation requires it in the **Local Machine > Trusted Root Certification Authorities** store.

The application is then available from the Start menu to all RDP users. Its shared database is created at `C:\Users\Public\Documents\Cleanlympics\data\cleanlympics.sqlite`, a location writable by interactive users and independent of the installed package.

If that shared file is absent on its first launch, Cleanlympics copies a legacy database from the previous desktop data location or `C:\CleanlympicsServer\data\cleanlympics.sqlite`. It never replaces an existing shared database. For a legacy database somewhere else, set `CLEANLYMPICS_LEGACY_DATABASE_PATH` to its complete file path for the first launch; after the copy is verified, remove that variable.

To use another shared volume, set the system environment variable `CLEANLYMPICS_DATABASE_PATH` to the complete SQLite file path, grant the RDP users read/write permission, and restart the application.

## Updates

Keep the code-signing private key safe; every later release must use the same publisher certificate and a higher version number. Import the certificate only once. Install each later MSIX with:

```powershell
Add-AppxPackage -Path .\Cleanlympics-<new-version>-win-x64.msix -ForceApplicationShutdown
```

This replaces the package in place and leaves the shared database untouched. Do not uninstall Cleanlympics as part of an update. Back up the SQLite file before each update.

## Backup

```powershell
Copy-Item 'C:\Users\Public\Documents\Cleanlympics\data\cleanlympics.sqlite' "C:\CleanlympicsBackups\cleanlympics-$(Get-Date -Format yyyyMMdd-HHmmss).sqlite"
```
