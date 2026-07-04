#!/bin/sh

set -eu

# Can be overridden if needed, e.g.:
# BAYONO_RELEASE_BASE_URL="https://.../release" ./auto-install.sh
RELEASE_BASE_URL=${BAYONO_RELEASE_BASE_URL:-https://github.com/bayono/bayono-desktop-public/raw/refs/heads/main/release}

log() {
	printf '%s\n' "[bayono-auto-install] $*"
}

fail() {
	printf '%s\n' "[bayono-auto-install] ERROR: $*" >&2
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

create_tmp_dir() {
	if command -v mktemp >/dev/null 2>&1; then
		if tmp=$(mktemp -d 2>/dev/null); then
			printf '%s\n' "$tmp"
			return 0
		fi

		if tmp=$(mktemp -d -t bayono-auto-install 2>/dev/null); then
			printf '%s\n' "$tmp"
			return 0
		fi
	fi

	fallback="${TMPDIR:-/tmp}/bayono-auto-install-$$"
	(umask 077 && mkdir "$fallback") || fail "Unable to create temp directory"
	printf '%s\n' "$fallback"
}

main() {
	require_cmd uname
	require_cmd chmod

	os=$(detect_os)
	arch=$(detect_arch)

  # == Setup: Binary Name ==
	binary_name="main-cli-${os}-${arch}"
	if [ "$os" = "windows" ]; then
		binary_name="${binary_name}.exe"
	fi

  # == Setup: General ==
	binary_url="${RELEASE_BASE_URL}/latest/main-cli/${binary_name}"
	tmp_dir=$(create_tmp_dir)
	trap 'rm -rf "$tmp_dir"' EXIT HUP INT TERM

  # == Setup: Storage Path ==
	main_cli_path="${tmp_dir}/main-cli"
	if [ "$os" = "windows" ]; then
		main_cli_path="${main_cli_path}.exe"
	fi

  # == Download Main CLI ==
	log "Detected platform: ${os}-${arch}"
	log "Downloading: ${binary_url}"
	download_file "$binary_url" "$main_cli_path"
	chmod +x "$main_cli_path" || true

  # == Run Installation Command ==
	log "Running: main-cli (bootstrapped) install"
	# n.b. that __shim:bootstrap-install is shimmed install for main-cli
	"$main_cli_path" __shim:bootstrap-install

  # == Post ==
	log "Installation command finished successfully"
}

main "$@"
