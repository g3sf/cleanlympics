# Cleanlympics Electron Staff Beta 0.2.3

Electron desktop client plus a shared Windows Server API and SQLite database.

## Included

- Windows NSIS `.exe` installer configuration
- Mop-torch desktop and Start menu icon
- Administrator and Team Leader authentication
- Twelve checklist types with 176 task lines
- Done, Not Done and Not Applicable task controls
- Editable teams, members and checklist names
- Day and Evening divisions
- Attendance, excused reasons, participation bonuses and penalties
- Daily scoring submissions, plotted history graphs and shared standings
- Administrator review, printable standings and acknowledgements
- Awards, citations, No Report reports and Estates Alerts
- Estates Alert storage
- English/Spanish desktop shell
- Windows Server installation and backup scripts

## Development

1. Install Node.js 22.
2. Run `npm install` from this folder.
3. Copy `apps/server/.env.example` to `apps/server/.env` and change the password and secret.
4. Run `npm run dev`.

## Build the installer

On Windows, double-click `BUILD-WINDOWS-INSTALLER.bat`. It installs dependencies,
runs the scoring tests and builds the NSIS `.exe`. The installer appears in
`apps/desktop/release`.

See `docs/WINDOWS-SERVER-DEPLOYMENT.md` for server transfer instructions.

## Staff beta notes

- Team, member and checklist names are editable and shared.
- Daily results, checklist-line answers, standings, alerts, citations and award claims persist centrally.
- The work date is selectable. Team Leaders and administrators can enter earlier dates as backlog records; each date keeps separate task and attendance answers.
- New databases begin with 0 points and no pre-awarded standings, honors, citations or frequent offenders.
- Launch Season defaults to September 1–30, 2026 and Week 1. The administrator can edit its name, theme, dates and current week from Season setup.
- New databases include an editable team for every checklist, but no sample members or Team Leader accounts.
- People & Access creates and edits real Team Leader sign-in accounts, passwords, team assignments and member rosters.
- Acknowledgements stay blank until an administrator selects an actual winning team and award; names come only from that team's saved roster.
- Missing-report badges, dashboard totals and report lists all use the same live database calculation instead of a demo count.
- Frequent-offender notices are generated only after three saved unexcused absence or non-participation records.
- Hardcopy photos can be taken or selected, previewed, attached to the dated submission, stored in the shared database, and opened during administrator review. Checklist answers remain Team Leader-confirmed.
- SQLite is shared through the API, never through a network file share.

Initial administrator login: `admin` / `Password123!`. Change it before staff use.
