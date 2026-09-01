param(
  [Parameter(Mandatory=$true)][string]$CertificateThumbprint,
  [Parameter(Mandatory=$true)][string]$PackagePath
)

$signTool=Get-ChildItem 'C:\Program Files (x86)\Windows Kits\10\bin' -Recurse -Filter signtool.exe |
  Where-Object {$_.FullName -match '\\x64\\'} |
  Sort-Object FullName -Descending |
  Select-Object -First 1 -ExpandProperty FullName

if(-not $signTool){throw 'SignTool.exe was not found. Install the Windows SDK signing tools.'}
if(-not (Test-Path -LiteralPath $PackagePath)){throw "MSIX package was not found: $PackagePath"}

& $signTool sign /sha1 $CertificateThumbprint /fd SHA256 /v $PackagePath
if($LASTEXITCODE -ne 0){throw 'MSIX signing failed.'}
& $signTool verify /pa /v $PackagePath
if($LASTEXITCODE -ne 0){throw 'MSIX signature verification failed.'}
