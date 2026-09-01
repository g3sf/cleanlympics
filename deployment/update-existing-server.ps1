param(
  [string]$InstallPath="C:\CleanlympicsServer",
  [string]$ServiceName="CleanlympicsServer",
  [string]$BackupFolder="C:\CleanlympicsBackups"
)
$ErrorActionPreference="Stop"
$database=Join-Path $InstallPath "data\cleanlympics.sqlite"
$service=Get-Service -Name $ServiceName -ErrorAction SilentlyContinue

if ($service -and $service.Status -ne "Stopped") {
  Stop-Service -Name $ServiceName
  $service.WaitForStatus("Stopped",[TimeSpan]::FromSeconds(30))
}

New-Item -ItemType Directory -Force -Path $BackupFolder | Out-Null
if (Test-Path $database) {
  $stamp=Get-Date -Format "yyyyMMdd-HHmmss"
  Copy-Item -Force $database (Join-Path $BackupFolder "cleanlympics-before-0.3.2-$stamp.sqlite")
}

New-Item -ItemType Directory -Force -Path "$InstallPath\src" | Out-Null
Copy-Item -Recurse -Force "$PSScriptRoot\..\apps\server\src\*" "$InstallPath\src"
Copy-Item -Force "$PSScriptRoot\..\apps\server\package.json" $InstallPath
Push-Location $InstallPath
npm install --omit=dev
Pop-Location

if ($service) { Start-Service -Name $ServiceName }
Write-Host "Cleanlympics Server updated. The existing database and .env file were preserved."
Write-Host "Backup folder: $BackupFolder"
