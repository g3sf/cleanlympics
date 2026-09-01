# Cleanlympics Staff Beta 0.3.2 upgrade

This release preserves the existing SQLite database and all backlog entries.

## Existing Windows Server installation

1. Keep the separate backup you already created.
2. Extract this release to a new folder.
3. Run `UPDATE-EXISTING-BETA.bat` as Administrator on the server.
4. Build and install the new desktop client with `BUILD-WINDOWS-INSTALLER.bat`.
5. Sign in and confirm the Administrator Portal reports zero pending reviews when all saved submissions are approved.

The update script backs up `C:\CleanlympicsServer\data\cleanlympics.sqlite`, replaces only the server application code, retains the existing `.env`, and restarts the `CleanlympicsServer` service.

Do not copy the packaged `apps\server\data` folder over an existing live server. It is included only so this supplied test copy retains the backlog data used to validate the upgrade.

## Release corrections

- Administrator review counts now use saved approval status.
- Team performance lines stop at the graph boundary.
- Empty dated checklists start at 0% answered and 0% score.
- Weeks are anchored to the season start date; Launch Season runs August 27 through October 1, 2026.
- Standings, acknowledgements, and No Report reports can be saved as PDF.
- An approved weekly award displays the supplied Café Borinquen gift card.
