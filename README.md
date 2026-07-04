# Bayono Desktop Public

- **Files:**
  - /bin: Main-cli, as a single binary ('bayono' or 'bayono.exe')
  - ctl-shell-shim: shell shims to call bayono-ctl (not-recommended)
  - get-bayono: get.bayono.com scripts
  - latest
    - ctl-cli: main cli
    - daemon: hub daemon
    - installer: installer, installs files - called by main-cli
    - main-cli: main cli, native binary, written in go, checks the js runtime, installs, etc.
    - project-client: project-client tied to a local 'bayono' project folder

```
release/
├── bin
│   ├── darwin
│   │   ├── amd64
│   │   │   ├── bayono
│   │   │   └── bayono.zip
│   │   └── arm64
│   │       ├── bayono
│   │       └── bayono.zip
│   ├── linux
│   │   ├── amd64
│   │   │   ├── bayono
│   │   │   └── bayono.zip
│   │   └── arm64
│   │       ├── bayono
│   │       └── bayono.zip
│   └── windows
│       ├── amd64
│       │   ├── bayono.exe
│       │   └── bayono.zip
│       └── arm64
│           ├── bayono.exe
│           └── bayono.zip
├── ctl-shell-shim
│   ├── bayono-ctl.cmd
│   └── bayono-ctl.sh
├── get-bayono
│   ├── auto-install.cmd
│   ├── auto-install.sh
│   ├── get-cli.cmd
│   └── get-cli.sh
└── latest
    ├── ctl-cli
    │   └── ctl-cli.mjs
    ├── daemon
    │   └── daemon.mjs
    ├── installer
    │   ├── installer-darwin-amd64
    │   ├── installer-darwin-arm64
    │   ├── installer-linux-amd64
    │   ├── installer-linux-arm64
    │   ├── installer-windows-amd64.exe
    │   └── installer-windows-arm64.exe
    ├── main-cli
    │   ├── main-cli-darwin-amd64
    │   ├── main-cli-darwin-arm64
    │   ├── main-cli-linux-amd64
    │   ├── main-cli-linux-arm64
    │   ├── main-cli-windows-amd64.exe
    │   └── main-cli-windows-arm64.exe
    └── project-client
        └── project-client.mjs
```
