@echo off
setlocal

set "RUNTIME="
where node >nul 2>nul && set "RUNTIME=node"
if not defined RUNTIME where bun >nul 2>nul && set "RUNTIME=bun"
if not defined RUNTIME where deno >nul 2>nul && set "RUNTIME=deno"

if not defined RUNTIME (
	echo Error: no JavaScript runtime found. Install one of: node, bun, deno.>&2
	exit /b 1
)

if not defined APPDATA (
	echo Error: APPDATA is not set.>&2
	exit /b 1
)

set "ENTRYPOINT=%APPDATA%\bayono\latest\ctl-cli\bayono-ctl.mjs"

if not exist "%ENTRYPOINT%" (
	echo Error: bayono ctl script not found: %ENTRYPOINT%>&2
	exit /b 1
)

if /I "%RUNTIME%"=="deno" (
	deno run -A "%ENTRYPOINT%" %*
) else (
	"%RUNTIME%" "%ENTRYPOINT%" %*
)

set "EXITCODE=%ERRORLEVEL%"
endlocal & exit /b %EXITCODE%
