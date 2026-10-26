$InstallDir = "$HOME\.quid\bin"
$Repo = "CSD-coder/QuidCLI"

Write-Host "[Quid Setup] Installing Quid CLI..." -ForegroundColor Cyan

if (!(Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
}

# Download quid.js directly from the root of your GitHub repository
$DownloadUrl = "https://raw.githubusercontent.com/$Repo/main/quid.js"
Invoke-WebRequest -Uri $DownloadUrl -OutFile "$InstallDir\quid.js"

# Create a command wrapper (.cmd) so you can just type 'quid'
$WrapperContent = @"
@echo off
node "$InstallDir\quid.js" %*
"@
Set-Content -Path "$InstallDir\quid.cmd" -Value $WrapperContent

# Add to user PATH if not already present
$UserPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($UserPath -notlike "*$InstallDir*") {
    [Environment]::SetEnvironmentVariable("Path", "$UserPath;$InstallDir", "User")
    Write-Host "[Quid Setup] Added $InstallDir to your PATH. Restart your terminal to use 'quid'." -ForegroundColor Green
}

Write-Host "[Quid Setup] Installation complete!" -ForegroundColor Green
