@echo off
setlocal EnableExtensions DisableDelayedExpansion

if not defined BAYONO_RELEASE_BASE_URL set "BAYONO_RELEASE_BASE_URL=https://github.com/bayono/bayono-desktop-public/raw/refs/heads/main/release"

call :detect_arch || exit /b 1

set "BINARY_NAME=main-cli-windows-%ARCH%.exe"
set "BINARY_URL=%BAYONO_RELEASE_BASE_URL%/latest/main-cli/%BINARY_NAME%"
set "MAIN_CLI=%CD%\bayono.exe"

call :download "%BINARY_URL%" "%MAIN_CLI%" || exit /b 1

echo Downloaded: %MAIN_CLI%
exit /b 0

:detect_arch
set "RAW_ARCH=%PROCESSOR_ARCHITECTURE%"
if /I "%PROCESSOR_ARCHITEW6432%"=="AMD64" set "RAW_ARCH=AMD64"
if /I "%PROCESSOR_ARCHITEW6432%"=="ARM64" set "RAW_ARCH=ARM64"

if /I "%RAW_ARCH%"=="AMD64" (
  set "ARCH=amd64"
  exit /b 0
)

if /I "%RAW_ARCH%"=="ARM64" (
  set "ARCH=arm64"
  exit /b 0
)

echo Unsupported architecture: %RAW_ARCH% 1>&2
exit /b 1

:download
set "URL=%~1"
set "OUT=%~2"

where curl >nul 2>&1
if not errorlevel 1 (
  curl -fL -o "%OUT%" "%URL%" >nul 2>&1
  if not errorlevel 1 exit /b 0
)

where certutil >nul 2>&1
if not errorlevel 1 (
  certutil -urlcache -split -f "%URL%" "%OUT%" >nul 2>&1
  if not errorlevel 1 exit /b 0
)

echo Failed to download main-cli. Install curl or enable certutil. 1>&2
exit /b 1
