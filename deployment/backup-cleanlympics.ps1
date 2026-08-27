param([string]$Database="C:\CleanlympicsServer\data\cleanlympics.sqlite",[string]$BackupFolder="C:\CleanlympicsBackups")
$ErrorActionPreference="Stop"
New-Item -ItemType Directory -Force -Path $BackupFolder|Out-Null
$stamp=Get-Date -Format "yyyyMMdd-HHmmss"
Copy-Item $Database "$BackupFolder\cleanlympics-$stamp.sqlite"
Get-ChildItem $BackupFolder -Filter "cleanlympics-*.sqlite"|Where-Object LastWriteTime -lt (Get-Date).AddDays(-30)|Remove-Item
