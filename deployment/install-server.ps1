param([string]$InstallPath="C:\CleanlympicsServer",[int]$Port=4317)
$ErrorActionPreference="Stop"
New-Item -ItemType Directory -Force -Path $InstallPath,"$InstallPath\data" | Out-Null
Copy-Item -Recurse -Force "$PSScriptRoot\..\apps\server\*" $InstallPath
Push-Location $InstallPath
npm install --omit=dev
if (!(Test-Path ".env")) {
  $secret=[Convert]::ToBase64String((1..48|ForEach-Object{Get-Random -Maximum 256}))
  @"
PORT=$Port
HOST=0.0.0.0
DATABASE_PATH=$InstallPath\data\cleanlympics.sqlite
JWT_SECRET=$secret
ADMIN_PASSWORD=ChangeMe123!
ALLOWED_ORIGINS=*
"@ | Set-Content ".env"
}
New-NetFirewallRule -DisplayName "Cleanlympics API" -Direction Inbound -Protocol TCP -LocalPort $Port -Action Allow -ErrorAction SilentlyContinue
Write-Host "Server installed. Change ADMIN_PASSWORD in $InstallPath\.env before first use."
Write-Host "Then register src\index.js as a Windows service using NSSM."
Pop-Location
