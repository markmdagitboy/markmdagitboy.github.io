<#
setup-node.ps1

Guided helper to resolve "npm : The term 'npm' is not recognized..." on Windows.

What it does:
- Detects whether `node` and `npm` are available in PATH and prints versions.
- If missing, detects if `winget` is available and offers to install Node.js LTS.
- If winget isn't available, offers to open the official Node.js download page.
- After a successful install, offers to run `npm ci` and `npm run build` in the repo root.

Run:
  Open PowerShell (recommended: run as Administrator for installations) and run:
    .\scripts\setup-node.ps1

Notes:
- This script asks for confirmation before installing anything. It will attempt to elevate
  the installation step if you agree and you're not running as Administrator.
- If you prefer `nvm-windows`, the script can also install that via winget when available.
#>

function Write-OK($msg){ Write-Host "[OK]    $msg" -ForegroundColor Green }
function Write-Warn($msg){ Write-Host "[WARN]  $msg" -ForegroundColor Yellow }
function Write-Err($msg){ Write-Host "[ERROR] $msg" -ForegroundColor Red }

Clear-Host
Write-Host "=== Node & npm setup helper ===" -ForegroundColor Cyan

function Test-HasCommand($name){
    return (Get-Command $name -ErrorAction SilentlyContinue) -ne $null
}

function Get-NodeInfo(){
    $node = Get-Command node -ErrorAction SilentlyContinue
    $npm = Get-Command npm -ErrorAction SilentlyContinue
    $info = [PSCustomObject]@{
        NodeFound = $node -ne $null
        NpmFound  = $npm -ne $null
        NodeVer   = $null
        NpmVer    = $null
    }
    if ($info.NodeFound) {
        try { $info.NodeVer = (& node -v) -replace "\r|\n" , "" } catch {}
    }
    if ($info.NpmFound) {
        try { $info.NpmVer = (& npm -v) -replace "\r|\n" , "" } catch {}
    }
    return $info
}

function Ensure-Admin(){
    $isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    return $isAdmin
}

$repoRoot = Split-Path -Path $MyInvocation.MyCommand.Path -Parent -Parent
Write-Host "Repository root detected: $repoRoot`n"

$info = Get-NodeInfo
if ($info.NodeFound -and $info.NpmFound) {
    Write-OK "Node found: $($info.NodeVer)"
    Write-OK "npm found:  $($info.NpmVer)"
    $run = Read-Host "Would you like to run 'npm ci' and 'npm run build' now in the repo root? (Y/n)"
    if (($run -eq '') -or ($run -match '^[Yy]')){
        Push-Location $repoRoot
        Write-Host "Running npm ci..."
        npm ci
        if ($LASTEXITCODE -ne 0){ Write-Warn "npm ci returned exit code $LASTEXITCODE" }
        Write-Host "Running npm run build..."
        npm run build
        if ($LASTEXITCODE -ne 0){ Write-Warn "npm run build returned exit code $LASTEXITCODE" }
        Pop-Location
    } else {
        Write-Host "No build requested. Exiting."
    }
    exit 0
}

Write-Warn "Node or npm was not found on this system."

$hasWinget = Test-HasCommand winget
if ($hasWinget) { Write-OK "winget is available" } else { Write-Warn "winget not found" }

Write-Host "Choose an option:"
Write-Host "  1) Install Node.js LTS using winget (recommended)"
Write-Host "  2) Install nvm-windows using winget (manage multiple Node versions)"
Write-Host "  3) Open Node.js download page in your browser"
Write-Host "  4) Cancel"

$choice = Read-Host "Enter 1, 2, 3 or 4"
switch ($choice) {
    '1' {
        if (-not $hasWinget) { Write-Err "winget is required for this option. Choose option 3 to download manually."; break }
        $confirm = Read-Host "Install Node.js LTS via winget now? This may require Administrator privileges. (Y/n)"
        if (($confirm -eq '') -or ($confirm -match '^[Yy]')){
            $isAdmin = Ensure-Admin
            $cmd = "winget install --id OpenJS.NodeJS.LTS -e --silent --accept-package-agreements --accept-source-agreements"
            if ($isAdmin) {
                Write-Host "Running: $cmd"
                iex $cmd
            } else {
                Write-Warn "Not running as Administrator. Attempting to elevate the installer. You may be prompted for consent."
                Start-Process -FilePath "winget" -ArgumentList "install --id OpenJS.NodeJS.LTS -e --silent --accept-package-agreements --accept-source-agreements" -Verb RunAs -Wait
            }
            Write-Host "Installation step finished. Attempting to locate Node in this session so we can run npm without a shell restart..."
            # Try to find node.exe in common install locations and add to session PATH
            function Try-RefreshNode {
                $candidates = @(
                    'C:\Program Files\nodejs\node.exe',
                    'C:\Program Files (x86)\nodejs\node.exe',
                    "$env:LOCALAPPDATA\Programs\nodejs\node.exe",
                    "$env:ProgramFiles\nodejs\node.exe",
                    "$env:USERPROFILE\AppData\Roaming\nvm\v18.20.0\node.exe",
                    "$env:USERPROFILE\AppData\nvm\v18.20.0\node.exe"
                )
                foreach ($p in $candidates) {
                    if (Test-Path $p) {
                        $dir = Split-Path $p -Parent
                        if (-not ($env:Path -split ';' | Where-Object { $_ -eq $dir })) {
                            $env:Path = "$env:Path;$dir"
                        }
                        Write-OK "Found node at $p; added to PATH for this session."
                        return $true
                    }
                }
                # Try where.exe which can find node if it's on disk somewhere in PATH
                try {
                    $whereOut = & where.exe node 2>$null
                    if ($whereOut) {
                        $first = ($whereOut -split "`r?`n")[0].Trim()
                        if (Test-Path $first) {
                            $dir = Split-Path $first -Parent
                            if (-not ($env:Path -split ';' | Where-Object { $_ -eq $dir })) {
                                $env:Path = "$env:Path;$dir"
                            }
                            Write-OK "Found node via where.exe at $first; added to PATH for this session."
                            return $true
                        }
                    }
                } catch {}
                return $false
            }

            $refreshed = Try-RefreshNode
            Start-Sleep -Seconds 1
            $info = Get-NodeInfo
            if (-not ($info.NodeFound -and $info.NpmFound) -and -not $refreshed) {
                Write-Warn "Couldn't detect node/npm in this session. If Node was installed, please close and re-open PowerShell and re-run this script."
            } else {
                # Re-run commands if detection now succeeds
                $info = Get-NodeInfo
                if ($info.NodeFound -and $info.NpmFound) {
                    Write-OK "Node now available: $($info.NodeVer)"
                    Write-OK "npm now available:  $($info.NpmVer)"
                    $run = Read-Host "Run 'npm ci' and 'npm run build' now? (Y/n)"
                    if (($run -eq '') -or ($run -match '^[Yy]')){
                        Push-Location $repoRoot
                        npm ci
                        if ($LASTEXITCODE -ne 0){ Write-Warn "npm ci returned exit code $LASTEXITCODE" }
                        npm run build
                        if ($LASTEXITCODE -ne 0){ Write-Warn "npm run build returned exit code $LASTEXITCODE" }
                        Pop-Location
                    }
                }
            }
        } else { Write-Host "Cancelled installation." }
    }
    '2' {
        if (-not $hasWinget) { Write-Err "winget is required for this option. Choose option 3 to download manually."; break }
        $confirm = Read-Host "Install nvm-windows via winget now? This may require Administrator privileges. (Y/n)"
        if (($confirm -eq '') -or ($confirm -match '^[Yy]')){
            $isAdmin = Ensure-Admin
            $cmd = "winget install --id coreybutler.nvm -e --silent"
            if ($isAdmin) {
                Write-Host "Running: $cmd"
                iex $cmd
            } else {
                Write-Warn "Not running as Administrator. Attempting to elevate the installer. You may be prompted for consent."
                Start-Process -FilePath "winget" -ArgumentList "install --id coreybutler.nvm -e --silent" -Verb RunAs -Wait
            }
            Write-Host "nvm-windows installation finished. Attempting to detect nvm/node in this session..."
            # Try to refresh PATH for nvm and auto-install/use Node
            function Try-RefreshNvmAndNode {
                # Check if nvm is available
                $nvmCmd = Get-Command nvm -ErrorAction SilentlyContinue
                if ($nvmCmd) { return $true }
                # Try common nvm-windows locations
                $nvmPathCandidates = @(
                    "$env:ProgramFiles\nvm\nvm.exe",
                    "$env:ProgramFiles(x86)\nvm\nvm.exe",
                    "$env:USERPROFILE\AppData\Roaming\nvm\nvm.exe"
                )
                foreach ($p in $nvmPathCandidates) {
                    if (Test-Path $p) {
                        $dir = Split-Path $p -Parent
                        if (-not ($env:Path -split ';' | Where-Object { $_ -eq $dir })) {
                            $env:Path = "$env:Path;$dir"
                        }
                        Write-OK "Found nvm at $p; added to PATH for this session."
                        return $true
                    }
                }
                return $false
            }

            $ok = Try-RefreshNvmAndNode
            Start-Sleep -Seconds 1
            $nvmCmd = Get-Command nvm -ErrorAction SilentlyContinue
            if ($nvmCmd) {
                Write-OK "nvm detected. Installing Node 18.20.0 via nvm..."
                & nvm install 18.20.0
                & nvm use 18.20.0
                # After using nvm, try to detect node/npm
                $refreshed = Try-RefreshNode
                $info = Get-NodeInfo
                if ($info.NodeFound -and $info.NpmFound) {
                    Write-OK "Node available: $($info.NodeVer)"
                    Write-OK "npm available:  $($info.NpmVer)"
                    $run = Read-Host "Run 'npm ci' and 'npm run build' now? (Y/n)"
                    if (($run -eq '') -or ($run -match '^[Yy]')){
                        Push-Location $repoRoot
                        npm ci
                        if ($LASTEXITCODE -ne 0){ Write-Warn "npm ci returned exit code $LASTEXITCODE" }
                        npm run build
                        if ($LASTEXITCODE -ne 0){ Write-Warn "npm run build returned exit code $LASTEXITCODE" }
                        Pop-Location
                    }
                } else {
                    Write-Warn "Could not detect node/npm after nvm use. Please restart PowerShell and run the script again."
                }
            } else {
                Write-Host "nvm not detected in the current session. After installing, restart PowerShell and run: nvm install 18.20.0; nvm use 18.20.0"
            }
        } else { Write-Host "Cancelled installation." }
    }
    '3' {
        Write-Host "Opening Node.js download page in your default browser..."
        Start-Process "https://nodejs.org/en/download/"
    }
    Default { Write-Host "Cancelled. No changes made." }
}

Write-Host "\nAfter installing, restart PowerShell and run this script again to verify (or run 'node -v' and 'npm -v')."

exit 0
