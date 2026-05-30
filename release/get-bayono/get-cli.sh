#!/bin/sh

set -eu

# Can be overridden if needed, e.g.:
# BAYONO_RELEASE_BASE_URL="https://.../release" ./auto-install.sh
RELEASE_BASE_URL=${BAYONO_RELEASE_BASE_URL:-https://github.com/bayono/bayono-desktop-public/raw/refs/heads/main/release}

log() {
	printf '%s\n' "[bayono-get] $*"
}

fail() {
	printf '%s\n' "[bayono-get] ERROR: $*" >&2
	exit 1
}

require_cmd() {
	if ! command -v "$1" >/dev/null 2>&1; then
		fail "Required command not found: $1"
	fi
}

detect_os() {
	sys_name=$(uname -s 2>/dev/null || echo unknown)
	case "$sys_name" in
		Linux)
			printf 'linux\n'
			;;
		Darwin)
			printf 'darwin\n'
			;;
		MINGW*|MSYS*|CYGWIN*|Windows_NT)
			printf 'windows\n'
			;;
		*)
			fail "Unsupported operating system: $sys_name"
			;;
	esac
}

detect_arch() {
	machine=$(uname -m 2>/dev/null || echo unknown)
	case "$machine" in
		x86_64|amd64)
			printf 'amd64\n'
			;;
		aarch64|arm64)
			printf 'arm64\n'
			;;
		*)
			fail "Unsupported architecture: $machine"
			;;
	esac
}

download_file() {
	url=$1
	output=$2

	if command -v curl >/dev/null 2>&1; then
		curl -fL -o "$output" "$url"
		return 0
	fi

	if command -v wget >/dev/null 2>&1; then
		wget -O "$output" "$url"
		return 0
	fi

	if command -v fetch >/dev/null 2>&1; then
		fetch -o "$output" "$url"
		return 0
	fi

	fail "No downloader available. Install curl, wget, or fetch"
}

main() {
	require_cmd uname
	require_cmd chmod

	os=$(detect_os)
	arch=$(detect_arch)

  # == Setup: Binary Name ==
	binary_name="main-cli-${os}-${arch}"
	new_name="bayono"
	if [ "$os" = "windows" ]; then
		binary_name="${binary_name}.exe"
		new_name="${new_name}.exe"
	fi

	binary_url="${RELEASE_BASE_URL}/latest/main-cli/${binary_name}"
	main_cli_path="./${new_name}"

	log "Detected platform: ${os}-${arch}"
	log "Downloading: ${binary_url}"
	download_file "$binary_url" "$main_cli_path"
	chmod +x "$main_cli_path"
	log "Downloaded: ${main_cli_path}"
}

main "$@"
