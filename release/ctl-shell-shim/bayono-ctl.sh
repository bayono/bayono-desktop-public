#!/usr/bin/env sh

set -eu

pick_runtime() {
	if command -v node >/dev/null 2>&1; then
		printf '%s' "node"
		return 0
	fi

	if command -v bun >/dev/null 2>&1; then
		printf '%s' "bun"
		return 0
	fi

	if command -v deno >/dev/null 2>&1; then
		printf '%s' "deno"
		return 0
	fi

	return 1
}

resolve_app_data_dir() {
	os_name="$(uname -s)"
	case "${os_name}" in
		Darwin)
			if [ -z "${HOME:-}" ]; then
				echo "Error: cannot determine home directory." >&2
				return 1
			fi
			printf '%s' "${HOME}/Library/Application Support"
			;;
		Linux)
			if [ -n "${XDG_CONFIG_HOME:-}" ]; then
				printf '%s' "${XDG_CONFIG_HOME}"
				return 0
			fi

			if [ -z "${HOME:-}" ]; then
				echo "Error: cannot determine home directory." >&2
				return 1
			fi

			printf '%s' "${HOME}/.config"
			;;
		CYGWIN*|MINGW*|MSYS*)
			if [ -n "${APPDATA:-}" ]; then
				printf '%s' "${APPDATA}"
			else
				echo "Error: APPDATA is not set." >&2
				return 1
			fi
			;;
		*)
			echo "Error: unsupported platform: ${os_name}" >&2
			return 1
			;;
	esac
}

if ! runtime="$(pick_runtime)"; then
	echo "Error: no JavaScript runtime found. Install one of: node, bun, deno." >&2
	exit 1
fi

if ! app_data_dir="$(resolve_app_data_dir)"; then
	exit 1
fi
entrypoint="${app_data_dir}/bayono/latest/ctl-cli/bayono-ctl.mjs"

if [ ! -f "${entrypoint}" ]; then
	echo "Error: bayono ctl script not found: ${entrypoint}" >&2
	exit 1
fi

if [ "${runtime}" = "deno" ]; then
	exec deno run -A "${entrypoint}" "$@"
else
	exec "${runtime}" "${entrypoint}" "$@"
fi

