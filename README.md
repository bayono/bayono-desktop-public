# Bayono Desktop

Public release repository for Bayono Desktop and CLI.

This repo contains packaged Bayono binaries and install scripts for macOS, Linux, and Windows. It is intended for downloading and running released builds, not for day-to-day source development.

## What's in this repo

- `release/bin/` - platform-specific packaged binary for the CLI
  - See: [CLI](#cli) for more details on the CLI and its contents
- `release/latest/` - main artifacts that the CLI checks and installs
  - **main-cli**: Main CLI (also in `release/bin`), a binary application that acts as a thin wrapper to the main ctl-cli, and provides some minor behavior like simple validation, directly calling launcher, and resolving JS runtime.
    - See: [CLI](#cli) for more details on the CLI and its contents
  - **ctl-cli**: Real inner CLI application that holds the main logic, but requires a JS runtime
  - **daemon**: Shared server for CLI, apps, extensions, etc.
  - **launcher**: Installs, updates, repairs installs. Called by CLI for dealing with installation issues (e.g. no installation found)
  - **project-client**: Long running process tied to a specific project. Accessed using the CLI tool.
- `release/get-bayono/` - bootstrap install scripts for [get.bayono.com](https://get.bayono.com)

## Download

### From Web App

Download from Web App (https://bayono.com).

### Script

Linux/macOS:

```sh
curl -fsSL get.bayono.com/auto-install.sh | sh
```

### Manual Download

- Download from `release/bin/`
  - Windows:
    - windows/amd64/bayono.exe
    - windows-arm64/bayono.exe
  - macOS:
    - darwin/amd64/bayono
    - darwin/arm64/bayono
  - Linux:
    - linux/amd64/bayono
    - linux/arm64/bayono

## Install

**CLI**:

- Downloading and running the CLI automatically checks if it can find the relevant installation; and auto-installs if not found.

**Alternatively**:

- Installer scripts from [get.bayono.com](https://get.bayono.com) (e.g., `auto-install.sh`) will also directly install.

## CLI

The main CLI currently exposes:

```sh
bayono status
bayono daemon
```

You can also view help with:

```sh
bayono --help
```

## Source / Project links

- Website: https://bayono.com

## TODO:

- Add links to docs about `bayono-cli` usage
- Add details about starting `project-client`
