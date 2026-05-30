import process$1 from "node:process";
import os from "node:os";
import tty from "node:tty";
import util from "node:util";
//#region node_modules/chalk/source/vendor/ansi-styles/index.js
const ANSI_BACKGROUND_OFFSET = 10;
const wrapAnsi16 = (offset = 0) => (code) => `\u001B[${code + offset}m`;
const wrapAnsi256 = (offset = 0) => (code) => `\u001B[${38 + offset};5;${code}m`;
const wrapAnsi16m = (offset = 0) => (red, green, blue) => `\u001B[${38 + offset};2;${red};${green};${blue}m`;
const styles$1 = {
	modifier: {
		reset: [0, 0],
		bold: [1, 22],
		dim: [2, 22],
		italic: [3, 23],
		underline: [4, 24],
		overline: [53, 55],
		inverse: [7, 27],
		hidden: [8, 28],
		strikethrough: [9, 29]
	},
	color: {
		black: [30, 39],
		red: [31, 39],
		green: [32, 39],
		yellow: [33, 39],
		blue: [34, 39],
		magenta: [35, 39],
		cyan: [36, 39],
		white: [37, 39],
		blackBright: [90, 39],
		gray: [90, 39],
		grey: [90, 39],
		redBright: [91, 39],
		greenBright: [92, 39],
		yellowBright: [93, 39],
		blueBright: [94, 39],
		magentaBright: [95, 39],
		cyanBright: [96, 39],
		whiteBright: [97, 39]
	},
	bgColor: {
		bgBlack: [40, 49],
		bgRed: [41, 49],
		bgGreen: [42, 49],
		bgYellow: [43, 49],
		bgBlue: [44, 49],
		bgMagenta: [45, 49],
		bgCyan: [46, 49],
		bgWhite: [47, 49],
		bgBlackBright: [100, 49],
		bgGray: [100, 49],
		bgGrey: [100, 49],
		bgRedBright: [101, 49],
		bgGreenBright: [102, 49],
		bgYellowBright: [103, 49],
		bgBlueBright: [104, 49],
		bgMagentaBright: [105, 49],
		bgCyanBright: [106, 49],
		bgWhiteBright: [107, 49]
	}
};
Object.keys(styles$1.modifier);
const foregroundColorNames = Object.keys(styles$1.color);
const backgroundColorNames = Object.keys(styles$1.bgColor);
[...foregroundColorNames, ...backgroundColorNames];
function assembleStyles() {
	const codes = /* @__PURE__ */ new Map();
	for (const [groupName, group] of Object.entries(styles$1)) {
		for (const [styleName, style] of Object.entries(group)) {
			styles$1[styleName] = {
				open: `\u001B[${style[0]}m`,
				close: `\u001B[${style[1]}m`
			};
			group[styleName] = styles$1[styleName];
			codes.set(style[0], style[1]);
		}
		Object.defineProperty(styles$1, groupName, {
			value: group,
			enumerable: false
		});
	}
	Object.defineProperty(styles$1, "codes", {
		value: codes,
		enumerable: false
	});
	styles$1.color.close = "\x1B[39m";
	styles$1.bgColor.close = "\x1B[49m";
	styles$1.color.ansi = wrapAnsi16();
	styles$1.color.ansi256 = wrapAnsi256();
	styles$1.color.ansi16m = wrapAnsi16m();
	styles$1.bgColor.ansi = wrapAnsi16(ANSI_BACKGROUND_OFFSET);
	styles$1.bgColor.ansi256 = wrapAnsi256(ANSI_BACKGROUND_OFFSET);
	styles$1.bgColor.ansi16m = wrapAnsi16m(ANSI_BACKGROUND_OFFSET);
	Object.defineProperties(styles$1, {
		rgbToAnsi256: {
			value(red, green, blue) {
				if (red === green && green === blue) {
					if (red < 8) return 16;
					if (red > 248) return 231;
					return Math.round((red - 8) / 247 * 24) + 232;
				}
				return 16 + 36 * Math.round(red / 255 * 5) + 6 * Math.round(green / 255 * 5) + Math.round(blue / 255 * 5);
			},
			enumerable: false
		},
		hexToRgb: {
			value(hex) {
				const matches = /[a-f\d]{6}|[a-f\d]{3}/i.exec(hex.toString(16));
				if (!matches) return [
					0,
					0,
					0
				];
				let [colorString] = matches;
				if (colorString.length === 3) colorString = [...colorString].map((character) => character + character).join("");
				const integer = Number.parseInt(colorString, 16);
				return [
					integer >> 16 & 255,
					integer >> 8 & 255,
					integer & 255
				];
			},
			enumerable: false
		},
		hexToAnsi256: {
			value: (hex) => styles$1.rgbToAnsi256(...styles$1.hexToRgb(hex)),
			enumerable: false
		},
		ansi256ToAnsi: {
			value(code) {
				if (code < 8) return 30 + code;
				if (code < 16) return 90 + (code - 8);
				let red;
				let green;
				let blue;
				if (code >= 232) {
					red = ((code - 232) * 10 + 8) / 255;
					green = red;
					blue = red;
				} else {
					code -= 16;
					const remainder = code % 36;
					red = Math.floor(code / 36) / 5;
					green = Math.floor(remainder / 6) / 5;
					blue = remainder % 6 / 5;
				}
				const value = Math.max(red, green, blue) * 2;
				if (value === 0) return 30;
				let result = 30 + (Math.round(blue) << 2 | Math.round(green) << 1 | Math.round(red));
				if (value === 2) result += 60;
				return result;
			},
			enumerable: false
		},
		rgbToAnsi: {
			value: (red, green, blue) => styles$1.ansi256ToAnsi(styles$1.rgbToAnsi256(red, green, blue)),
			enumerable: false
		},
		hexToAnsi: {
			value: (hex) => styles$1.ansi256ToAnsi(styles$1.hexToAnsi256(hex)),
			enumerable: false
		}
	});
	return styles$1;
}
const ansiStyles = assembleStyles();
//#endregion
//#region node_modules/chalk/source/vendor/supports-color/index.js
function hasFlag(flag, argv = globalThis.Deno ? globalThis.Deno.args : process$1.argv) {
	const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
	const position = argv.indexOf(prefix + flag);
	const terminatorPosition = argv.indexOf("--");
	return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
}
const { env } = process$1;
let flagForceColor;
if (hasFlag("no-color") || hasFlag("no-colors") || hasFlag("color=false") || hasFlag("color=never")) flagForceColor = 0;
else if (hasFlag("color") || hasFlag("colors") || hasFlag("color=true") || hasFlag("color=always")) flagForceColor = 1;
function envForceColor() {
	if ("FORCE_COLOR" in env) {
		if (env.FORCE_COLOR === "true") return 1;
		if (env.FORCE_COLOR === "false") return 0;
		return env.FORCE_COLOR.length === 0 ? 1 : Math.min(Number.parseInt(env.FORCE_COLOR, 10), 3);
	}
}
function translateLevel(level) {
	if (level === 0) return false;
	return {
		level,
		hasBasic: true,
		has256: level >= 2,
		has16m: level >= 3
	};
}
function _supportsColor(haveStream, { streamIsTTY, sniffFlags = true } = {}) {
	const noFlagForceColor = envForceColor();
	if (noFlagForceColor !== void 0) flagForceColor = noFlagForceColor;
	const forceColor = sniffFlags ? flagForceColor : noFlagForceColor;
	if (forceColor === 0) return 0;
	if (sniffFlags) {
		if (hasFlag("color=16m") || hasFlag("color=full") || hasFlag("color=truecolor")) return 3;
		if (hasFlag("color=256")) return 2;
	}
	if ("TF_BUILD" in env && "AGENT_NAME" in env) return 1;
	if (haveStream && !streamIsTTY && forceColor === void 0) return 0;
	const min = forceColor || 0;
	if (env.TERM === "dumb") return min;
	if (process$1.platform === "win32") {
		const osRelease = os.release().split(".");
		if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) return Number(osRelease[2]) >= 14931 ? 3 : 2;
		return 1;
	}
	if ("CI" in env) {
		if ([
			"GITHUB_ACTIONS",
			"GITEA_ACTIONS",
			"CIRCLECI"
		].some((key) => key in env)) return 3;
		if ([
			"TRAVIS",
			"APPVEYOR",
			"GITLAB_CI",
			"BUILDKITE",
			"DRONE"
		].some((sign) => sign in env) || env.CI_NAME === "codeship") return 1;
		return min;
	}
	if ("TEAMCITY_VERSION" in env) return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
	if (env.COLORTERM === "truecolor") return 3;
	if (env.TERM === "xterm-kitty") return 3;
	if (env.TERM === "xterm-ghostty") return 3;
	if (env.TERM === "wezterm") return 3;
	if ("TERM_PROGRAM" in env) {
		const version = Number.parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
		switch (env.TERM_PROGRAM) {
			case "iTerm.app": return version >= 3 ? 3 : 2;
			case "Apple_Terminal": return 2;
		}
	}
	if (/-256(color)?$/i.test(env.TERM)) return 2;
	if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) return 1;
	if ("COLORTERM" in env) return 1;
	return min;
}
function createSupportsColor(stream, options = {}) {
	return translateLevel(_supportsColor(stream, {
		streamIsTTY: stream && stream.isTTY,
		...options
	}));
}
const supportsColor = {
	stdout: createSupportsColor({ isTTY: tty.isatty(1) }),
	stderr: createSupportsColor({ isTTY: tty.isatty(2) })
};
//#endregion
//#region node_modules/chalk/source/utilities.js
function stringReplaceAll(string, substring, replacer) {
	let index = string.indexOf(substring);
	if (index === -1) return string;
	const substringLength = substring.length;
	let endIndex = 0;
	let returnValue = "";
	do {
		returnValue += string.slice(endIndex, index) + substring + replacer;
		endIndex = index + substringLength;
		index = string.indexOf(substring, endIndex);
	} while (index !== -1);
	returnValue += string.slice(endIndex);
	return returnValue;
}
function stringEncaseCRLFWithFirstIndex(string, prefix, postfix, index) {
	let endIndex = 0;
	let returnValue = "";
	do {
		const gotCR = string[index - 1] === "\r";
		returnValue += string.slice(endIndex, gotCR ? index - 1 : index) + prefix + (gotCR ? "\r\n" : "\n") + postfix;
		endIndex = index + 1;
		index = string.indexOf("\n", endIndex);
	} while (index !== -1);
	returnValue += string.slice(endIndex);
	return returnValue;
}
//#endregion
//#region node_modules/chalk/source/index.js
const { stdout: stdoutColor, stderr: stderrColor } = supportsColor;
const GENERATOR = Symbol("GENERATOR");
const STYLER = Symbol("STYLER");
const IS_EMPTY = Symbol("IS_EMPTY");
const levelMapping = [
	"ansi",
	"ansi",
	"ansi256",
	"ansi16m"
];
const styles = Object.create(null);
const applyOptions = (object, options = {}) => {
	if (options.level && !(Number.isInteger(options.level) && options.level >= 0 && options.level <= 3)) throw new Error("The `level` option should be an integer from 0 to 3");
	const colorLevel = stdoutColor ? stdoutColor.level : 0;
	object.level = options.level === void 0 ? colorLevel : options.level;
};
const chalkFactory = (options) => {
	const chalk = (...strings) => strings.join(" ");
	applyOptions(chalk, options);
	Object.setPrototypeOf(chalk, createChalk.prototype);
	return chalk;
};
function createChalk(options) {
	return chalkFactory(options);
}
Object.setPrototypeOf(createChalk.prototype, Function.prototype);
for (const [styleName, style] of Object.entries(ansiStyles)) styles[styleName] = { get() {
	const builder = createBuilder(this, createStyler(style.open, style.close, this[STYLER]), this[IS_EMPTY]);
	Object.defineProperty(this, styleName, { value: builder });
	return builder;
} };
styles.visible = { get() {
	const builder = createBuilder(this, this[STYLER], true);
	Object.defineProperty(this, "visible", { value: builder });
	return builder;
} };
const getModelAnsi = (model, level, type, ...arguments_) => {
	if (model === "rgb") {
		if (level === "ansi16m") return ansiStyles[type].ansi16m(...arguments_);
		if (level === "ansi256") return ansiStyles[type].ansi256(ansiStyles.rgbToAnsi256(...arguments_));
		return ansiStyles[type].ansi(ansiStyles.rgbToAnsi(...arguments_));
	}
	if (model === "hex") return getModelAnsi("rgb", level, type, ...ansiStyles.hexToRgb(...arguments_));
	return ansiStyles[type][model](...arguments_);
};
for (const model of [
	"rgb",
	"hex",
	"ansi256"
]) {
	styles[model] = { get() {
		const { level } = this;
		return function(...arguments_) {
			const styler = createStyler(getModelAnsi(model, levelMapping[level], "color", ...arguments_), ansiStyles.color.close, this[STYLER]);
			return createBuilder(this, styler, this[IS_EMPTY]);
		};
	} };
	const bgModel = "bg" + model[0].toUpperCase() + model.slice(1);
	styles[bgModel] = { get() {
		const { level } = this;
		return function(...arguments_) {
			const styler = createStyler(getModelAnsi(model, levelMapping[level], "bgColor", ...arguments_), ansiStyles.bgColor.close, this[STYLER]);
			return createBuilder(this, styler, this[IS_EMPTY]);
		};
	} };
}
const proto = Object.defineProperties(() => {}, {
	...styles,
	level: {
		enumerable: true,
		get() {
			return this[GENERATOR].level;
		},
		set(level) {
			this[GENERATOR].level = level;
		}
	}
});
const createStyler = (open, close, parent) => {
	let openAll;
	let closeAll;
	if (parent === void 0) {
		openAll = open;
		closeAll = close;
	} else {
		openAll = parent.openAll + open;
		closeAll = close + parent.closeAll;
	}
	return {
		open,
		close,
		openAll,
		closeAll,
		parent
	};
};
const createBuilder = (self, _styler, _isEmpty) => {
	const builder = (...arguments_) => applyStyle(builder, arguments_.length === 1 ? "" + arguments_[0] : arguments_.join(" "));
	Object.setPrototypeOf(builder, proto);
	builder[GENERATOR] = self;
	builder[STYLER] = _styler;
	builder[IS_EMPTY] = _isEmpty;
	return builder;
};
const applyStyle = (self, string) => {
	if (self.level <= 0 || !string) return self[IS_EMPTY] ? "" : string;
	let styler = self[STYLER];
	if (styler === void 0) return string;
	const { openAll, closeAll } = styler;
	if (string.includes("\x1B")) while (styler !== void 0) {
		string = stringReplaceAll(string, styler.close, styler.open);
		styler = styler.parent;
	}
	const lfIndex = string.indexOf("\n");
	if (lfIndex !== -1) string = stringEncaseCRLFWithFirstIndex(string, closeAll, openAll, lfIndex);
	return openAll + string + closeAll;
};
Object.defineProperties(createChalk.prototype, styles);
const chalk = createChalk();
createChalk({ level: stderrColor ? stderrColor.level : 0 });
//#endregion
//#region src/scripts/project-client/sliver-tui/index.mjs
const cursorCodes = {
	hide: "\x1B[?25l",
	show: "\x1B[?25h",
	moveUp: (lines) => `\u001B[${lines}A`,
	moveDown: (lines) => `\u001B[${lines}B`,
	moveLeft: (cols) => `\u001B[${cols}D`,
	moveRight: (cols) => `\u001B[${cols}C`,
	moveToStartOfLine: "\x1B[0G",
	stashPosition: "\x1B7",
	restorePosition: "\x1B8",
	clearLine: "\x1B[2K",
	clearToEndOfLine: "\x1B[0K",
	clearBelow: "\x1B[0J",
	clearAbove: "\x1B[1J",
	clearScreen: "\x1B[2J",
	styleReset: "\x1B[0m",
	moveToColumn: (col) => `\u001B[${col}G`,
	moveToRow: (row) => `\u001B[${row};0H`,
	moveToTopLeft: "\x1B[H",
	moveToBottomLeft: "\x1B[9999;0H",
	clearNewLine: "\x1B[0K\n"
};
const cursorUtils = {
	hideCursor: () => process.stdout.write("\x1B[?25l"),
	showCursor: () => process.stdout.write("\x1B[?25h"),
	moveUp: (lines) => process.stdout.write(`\u001B[${lines}A`),
	moveDown: (lines) => process.stdout.write(`\u001B[${lines}B`),
	moveLeft: (cols) => process.stdout.write(`\u001B[${cols}D`),
	moveRight: (cols) => process.stdout.write(`\u001B[${cols}C`),
	moveToStartOfLine: () => process.stdout.write("\x1B[0G"),
	stashCursorPosition: () => process.stdout.write("\x1B7"),
	restoreCursorPosition: () => process.stdout.write("\x1B8"),
	clearLine: () => process.stdout.write("\x1B[2K"),
	clearToEndOfLine: () => process.stdout.write("\x1B[0K"),
	clearBelow: () => process.stdout.write("\x1B[0J"),
	clearAbove: () => process.stdout.write("\x1B[1J"),
	clearScreen: () => process.stdout.write("\x1B[2J"),
	styleReset: () => process.stdout.write("\x1B[0m"),
	moveToColumn: (col) => process.stdout.write(`\u001B[${col}G`),
	moveToRow: (row) => process.stdout.write(`\u001B[${row};0H`),
	moveToTopLeft: () => process.stdout.write("\x1B[H"),
	moveToBottomLeft: () => process.stdout.write("\x1B[9999;0H")
};
let lines = [];
function print(msg) {
	lines.push(util.stripVTControlCharacters(msg));
	process.stdout.write(msg);
}
function println(msg = "") {
	lines.push(util.stripVTControlCharacters(msg));
	process.stdout.write(msg);
	cursorUtils.clearToEndOfLine();
	process.stdout.write("\n");
}
const textFormat = {
	centerBlockText(text, boxWidth = -1) {
		const textLines = text.split("\n");
		if (boxWidth === -1) {
			boxWidth = 0;
			for (const line of textLines) if (line.length > boxWidth) boxWidth = line.length;
		}
		const screenWidth = process.stdout.columns || 80;
		const spaces = Math.max(0, Math.floor((screenWidth - boxWidth) / 2));
		const padding = " ".repeat(spaces);
		return textLines.map((line) => {
			return padding + line;
		}).join("\n");
	},
	centerMultiLine: (text) => {
		return text.split("\n").map((line) => {
			const rawLine = line.replace(/\u001B\[[0-9;]*m/g, "");
			const cols = process.stdout.columns || 80;
			const spaces = Math.max(0, Math.floor((cols - rawLine.length) / 2));
			return " ".repeat(spaces) + line;
		}).join("\n");
	},
	clearToEnd() {
		return cursorUtils.clearToEndOfLine() + "\n";
	}
};
const formatters = {
	infoLabel: chalk.black.bgCyanBright,
	successLabel: chalk.ansi256(0).black.bgGreenBright,
	warningLabel: chalk.ansi256(0).black.bgYellowBright,
	errorLabel: chalk.ansi256(0).black.bgRedBright,
	purple: (x) => chalk.black.bgMagentaBright(x),
	violet: (x) => chalk.bgHex("#9e27ffff").black(x),
	lime: (x) => chalk.black.bgGreenBright(x),
	cyan: (x) => chalk.black.bgHex("#00ffff")(x),
	orange: (x) => chalk.black.bgHex("#ffa500")(x),
	highlighted: (x) => chalk.black.bgYellowBright(x),
	special: (x) => chalk.bold.magentaBright(x),
	blackWhite: (x) => chalk.black.bgWhite(x),
	bold: (x) => chalk.bold(x),
	dim: (x) => chalk.dim(x),
	text: chalk.white,
	info: chalk.cyanBright,
	success: chalk.greenBright,
	warning: chalk.yellowBright,
	error: chalk.redBright,
	greenText: chalk.greenBright,
	orangeText: chalk.hex("#ffa500"),
	violetText: chalk.hex("#9e27ffff"),
	link: chalk.cyan.underline,
	hyperlink(text, url = "") {
		return `\u001b]8;;${url}\u0007${text}\u001b]8;;\u0007`;
	}
};
var LinePrompt = class {
	hooks = {
		requestDraw: () => {},
		onSubmit: (input) => {}
	};
	constructor() {}
	promptPrefix = ">> ";
	line = [];
	_cursorPosition = 0;
	get cursorPosition() {
		return this._cursorPosition;
	}
	set cursorPosition(value) {
		this._cursorPosition = Math.max(0, Math.min(value, this.line.length));
	}
	onChange() {
		this.hooks.requestDraw();
	}
	addText(text) {
		if (text.length === 0) return;
		this.line.splice(this.cursorPosition, 0, text);
		this.cursorPosition += 1;
		this.onChange();
	}
	clear() {
		this.line = [];
		this.onChange();
	}
	submit() {
		const text = this.text();
		this.hooks.onSubmit(text);
		this.clear();
	}
	deleteForward(count = 1) {
		if (this.line.length === 0 || count <= 0 || this.cursorPosition >= this.line.length) return;
		const deleteCount = Math.min(count, this.line.length - this.cursorPosition);
		this.line.splice(this.cursorPosition, deleteCount);
		this.onChange();
	}
	deleteBackward(count = 1) {
		if (this.line.length === 0 || count <= 0 || this.cursorPosition <= 0) return;
		const deleteCount = Math.min(count, this.cursorPosition);
		this.line.splice(this.cursorPosition - deleteCount, deleteCount);
		this.cursorPosition -= deleteCount;
		this.onChange();
	}
	text() {
		return this.line.flat().join("");
	}
	drawableText(ctx) {
		if (this.line.length === 0) return [formatters.highlighted(" ")];
		if (ctx.cols < 5) return ["..."];
		const max = ctx.cols - 1;
		const lines = [];
		let currentLine = [];
		let currentLength = 0;
		let idx = 0;
		for (const char of this.line) {
			const charLength = 1;
			if (currentLength + charLength > max) {
				lines.push(currentLine.join(""));
				currentLine = [];
				currentLength = 0;
			}
			let text = char;
			if (idx === this.cursorPosition) text = formatters.highlighted(char);
			currentLine.push(text);
			currentLength += charLength;
			idx++;
		}
		if (this.cursorPosition === this.line.length) {
			if (currentLength + 1 > max) {
				lines.push(currentLine.join(""));
				currentLine = [];
			}
			currentLine.push(formatters.highlighted(" "));
		}
		lines.push(currentLine.join(""));
		return lines;
	}
	moveLeft(n = 1) {
		let oldPosition = this.cursorPosition;
		this.cursorPosition = Math.max(0, this.cursorPosition - n);
		if (this.cursorPosition !== oldPosition) this.onChange();
	}
	moveRight(n = 1) {
		let oldPosition = this.cursorPosition;
		this.cursorPosition = Math.min(this.line.length, this.cursorPosition + n);
		if (this.cursorPosition !== oldPosition) this.onChange();
	}
};
var MainView = class {
	text = [];
	tick(ctx) {
		if (ctx.text.trim().startsWith("/")) this.text = [
			"/clear",
			"/help",
			"/exit"
		];
		else this.text = [];
	}
	draw() {
		return this.text;
	}
};
var PrintBuffer = class {
	buffer = [];
	add(line) {
		this.buffer.push(line);
	}
	flush() {
		const response = this.buffer;
		this.buffer = [];
		return response;
	}
};
var AppState = class {
	constructor() {}
};
const drawUtils = {
	horizontalLine: (symbol = "─", length = process.stdout.columns) => symbol.repeat(length),
	line: (text = " ") => {
		return text + " ".repeat(process.stdout.columns - text.length);
	}
};
const clip = {
	prompt: formatters.orange(">> "),
	end: formatters.orange("/ - END - /")
};
function resetTerminal() {
	cursorUtils.styleReset();
	process.stdin.setRawMode(false);
	cursorUtils.showCursor();
}
function setupTerminal() {
	process.stdin.setRawMode(true);
	process.stdin.resume();
	cursorUtils.hideCursor();
}
const TerminalUtils = {
	resetTerminal,
	setupTerminal,
	getTerminalCols: () => process.stdout.columns || 80
};
const ctrlC = "";
const ctrlD = "";
const AnsiKeyCodes = {
	ctrlC,
	ctrlD,
	interrupt: ctrlC,
	endOfTransmission: ctrlD,
	backspace: "\b",
	deleteBack: "",
	deleteForward: "\x1B[3~",
	carriageReturn: "\r",
	home: "\x1B[H",
	end: "\x1B[F",
	pageUp: "\x1B[5~",
	pageDown: "\x1B[6~",
	arrowUp: "\x1B[A",
	arrowDown: "\x1B[B",
	arrowRight: "\x1B[C",
	arrowLeft: "\x1B[D"
};
function handleInterrupt() {
	console.log("exiting");
	process.exit();
}
function handleExit(app) {
	app.clear();
	console.log("\nExiting application...");
	println(clip.end);
	TerminalUtils.resetTerminal();
}
const io = AnsiKeyCodes;
const typedLookup = {
	[io.ctrlC]: (app) => process.emit("SIGINT"),
	[io.carriageReturn]: (app) => {
		app.promptLine.submit();
	},
	[io.backspace]: (app) => {
		app.promptLine.deleteBackward(1);
	},
	[io.deleteBack]: (app) => {
		app.promptLine.deleteBackward(1);
	},
	[io.deleteForward]: (app) => {
		app.promptLine.deleteForward(1);
	},
	[io.arrowUp]: (app) => {},
	[io.arrowDown]: (app) => {},
	[io.arrowLeft]: (app) => {
		app.promptLine.moveLeft();
	},
	[io.arrowRight]: (app) => {
		app.promptLine.moveRight();
	},
	[io.pageDown]: (app) => {},
	[io.pageUp]: (app) => {},
	[io.home]: (app) => {
		app.promptLine.moveLeft(Number.POSITIVE_INFINITY);
	},
	[io.end]: (app) => {
		app.promptLine.moveRight(Number.POSITIVE_INFINITY);
	}
};
function handleData(data, ctx) {
	const { app } = ctx;
	const d = data.toString();
	const found = typedLookup[d];
	if (found) return found(app);
	if (/[a-zA-Z0-9`~!@#$%^&*()_\-+={}[\]|\\;:'",.<>/?\s]/.test(d)) {
		app.promptLine.addText(d);
		return;
	}
}
const Handlers = {
	handleInterrupt,
	handleExit,
	handleData
};
const toPrint = [];
var App = class {
	lastDrawSize = 0;
	draw() {
		const cols = TerminalUtils.getTerminalCols();
		toPrint.length = 0;
		for (const ui of this.topUi) {
			const lines = ui.draw({ cols });
			for (const line of lines) toPrint.push(line);
		}
		{
			const mainViewLines = this.mainView.draw();
			if (mainViewLines.length > 0) {
				toPrint.push("");
				for (const line of mainViewLines) toPrint.push(line);
			}
		}
		{
			toPrint.push("");
			toPrint.push(drawUtils.horizontalLine("="));
			const padding = cols > 5 ? 2 : 0;
			const colLength = cols - padding * 2;
			const promptLines = this.promptLine.drawableText({ cols: colLength }).map((line) => " ".repeat(padding) + line);
			for (let i = 0; i < promptLines.length; i++) {
				let line = promptLines[i];
				toPrint.push(line);
			}
			toPrint.push(drawUtils.horizontalLine("="));
			toPrint.push("");
		}
		for (const ui of this.bottomUi) {
			const lines = ui.draw({ cols });
			for (const line of lines) toPrint.push(line);
		}
		cursorUtils.moveToBottomLeft();
		cursorUtils.moveUp(this.lastDrawSize - 1);
		{
			const bufferedLines = this.printBuffer.flush().join(cursorCodes.clearNewLine);
			if (bufferedLines.length > 0) println(bufferedLines);
		}
		{
			const diff = Math.max(0, this.lastDrawSize - toPrint.length);
			print(cursorCodes.clearNewLine.repeat(diff));
		}
		print(toPrint.join(cursorCodes.clearNewLine));
		if (toPrint.length <= 0) {
			cursorUtils.clearToEndOfLine();
			cursorUtils.clearBelow();
		}
		this.lastDrawSize = toPrint.length;
	}
	clear() {
		cursorUtils.moveToBottomLeft();
		cursorUtils.moveUp(this.lastDrawSize);
		cursorUtils.clearBelow();
	}
	topUi;
	bottomUi;
	promptLine;
	mainView;
	printBuffer;
	appState;
	actionOptions;
	constructor(args = {}) {
		this.args = args;
		const appState = new AppState();
		const promptLine = new LinePrompt();
		promptLine.hooks.requestDraw = () => {
			this.draw();
		};
		promptLine.hooks.onSubmit = (input) => {
			this.handleMessage(input);
		};
		promptLine.addText(args.startText ?? "");
		let uiElementsWarning = "";
		if (args.banContinuousElements) {
			const continuousElements = [...(args.topUi ?? []).filter((ui) => ui.characteristic.continuous), ...(args.bottomUi ?? []).filter((ui) => ui.characteristic.continuous)];
			if (continuousElements.length > 0) uiElementsWarning = `Warning: Continuous elements are banned, but the following were provided: ${continuousElements.map((ui) => ui.constructor.name).join(", ")}. These elements will not be rendered.`;
		}
		this.appState = appState;
		this.topUi = [...args.topUi ?? []];
		this.bottomUi = [...args.bottomUi ?? []];
		this.promptLine = promptLine;
		this.mainView = new MainView();
		this.printBuffer = new PrintBuffer();
		this.actionOptions = args.options ?? {};
		if (uiElementsWarning && !args.noWarnings) this.printBuffer.add(formatters.warning(uiElementsWarning));
		this.printBuffer.add(args.printOnStart ?? "");
	}
	started = false;
	start() {
		if (this.started) return;
		this.started = true;
		initApp(this);
		if (this.topUi.filter((ui) => ui.characteristic.continuous).length + this.bottomUi.filter((ui) => ui.characteristic.continuous).length > 0) setInterval(() => {
			this.update();
		}, 3e3);
		this.update();
	}
	update() {
		const text = this.promptLine.text();
		this.topUi.forEach((ui) => ui.tick({ text }));
		this.bottomUi.forEach((ui) => ui.tick({ text }));
		this.mainView.tick({ text });
		this.draw();
	}
	queuedDraw = null;
	requestDraw() {
		if (this.queuedDraw !== null) return;
		this.queuedDraw = setTimeout(() => {
			this.queuedDraw = null;
			this.update();
		}, 30);
	}
	printText(text) {
		this.printBuffer.add(text);
		this.requestDraw();
	}
	handleMessage(rawText) {
		const text = rawText.trim().toLowerCase();
		if (text === "/clear") {
			cursorUtils.clearScreen();
			return;
		} else if (text === "/help") {
			const mainOptions = [
				["/clear", "Clear the screen"],
				["/help", "Show this help message"],
				["/exit", "Exit the application"]
			];
			const otherOptions = Object.entries(this.actionOptions).map(([cmd, entry]) => [`/${cmd}`, entry.description]);
			const options = [...mainOptions, ...otherOptions];
			this.printBuffer.add("Available Commands:");
			const max = Math.max(...options.map(([cmd]) => cmd.length));
			for (const [cmd, desc] of options) {
				const padding = " ".repeat(Math.max(0, max - cmd.length));
				const cmdText = formatters.orangeText(" " + cmd + padding);
				this.printBuffer.add(`  ${cmdText} - ${desc}`);
			}
			return;
		} else if (text in this.actionOptions) {
			const action = this.actionOptions[text];
			if (action) action.action();
			return;
		} else if (text === "/exit") {
			process.exit(0);
			return;
		} else {
			if (this.args.onUnknownCommand) {
				const response = this.args.onUnknownCommand(text);
				this.printBuffer.add(response);
			} else this.printBuffer.add(rawText);
			return;
		}
	}
};
function initApp(app, config = {}) {
	{
		const topPadding = config.topPadding ?? 0;
		print("\n".repeat(topPadding));
	}
	if (!process.stdin.isTTY) {
		console.log("Not a TTY, exiting experiment.");
		process.exit(1);
	}
	TerminalUtils.setupTerminal();
	process.on("SIGINT", () => Handlers.handleInterrupt());
	process.on("exit", () => Handlers.handleExit(app));
	process.stdin.on("data", (data) => {
		Handlers.handleData(data, { app });
		app.requestDraw();
	});
}
const bannerAscii = {
	text: `   _
  | |__   __ _ _   _  ___  _ __   ___
  | '_ \\ / _' | | | |/ _ \\| '_ \\ / _ \\
  | |_) | (_| | |_| | (_) | | | | (_) |
  |_.__/ \\__,_|\\__, |\\___/|_| |_|\\___/
               |___/
`,
	width: 39,
	height: 5
};
const flowerAscii = {
	text: `
                  ++++++++++
                ++++++++++++++
              ++++         +++++
             ++++            +++
     ++++++++++++            +++ ++++++++
    +++++++++++++            +++++++++++++
  ++++       ++++            +++        ++++
  ++++         +++    ++   ++++         ++++
 ++++           ++++++++++++++           ++++
 ++               ++++++++++               ++
 ++          ++++++++    +++++++           ++
 ++++         ++++++      ++++++         ++++
  +++++       +++++        ++++        +++++
    ++++++++++++++++      ++++++++++++++++
       ++++++     ++++++++++     ++++++
     +++++      +++++++++++++       +++++
     ++++       ++    ++    ++       ++++
     ++               ++               ++
     ++               ++               ++
     ++++           +++++            ++++
      +++++         ++++++         +++++
        +++++     ++++++++++     +++++
         ++++++++++++    ++++++++++++
            ++++++          ++++++
`,
	width: 45,
	height: 24
};
const BannerUtils = { displayBanner() {
	cursorUtils.moveToBottomLeft();
	if (process.stdout.columns && process.stdout.columns >= flowerAscii.width) console.log(formatters.violetText(textFormat.centerBlockText(flowerAscii.text, flowerAscii.width)));
	if (process.stdout.columns && process.stdout.columns >= bannerAscii.width) console.log(formatters.violetText(textFormat.centerBlockText(bannerAscii.text, bannerAscii.width)));
	else if (process.stdout.columns && process.stdout.columns >= 11) {
		console.log(formatters.violet(drawUtils.horizontalLine(" ")));
		console.log(formatters.violet(drawUtils.horizontalLine(" ")));
		cursorUtils.moveUp(1);
		console.log(formatters.violet(textFormat.centerMultiLine("B A Y O N O")));
		console.log(formatters.violet(drawUtils.horizontalLine(" ")));
		console.log("");
	}
} };
//#endregion
//#region src/scripts/project-client/project-client.ts
const msg = (t) => `
Project Linked!
  - Directory: ${t}
`;
var ProjectClient = class {
	projectDir;
	tui;
	constructor(projectDir) {
		this.projectDir = projectDir;
		const message = msg(projectDir.rootDir);
		this.tui = new App({ printOnStart: message });
	}
	start() {
		BannerUtils.displayBanner();
		this.tui.start();
	}
};
//#endregion
export { ProjectClient };

//# sourceMappingURL=project-client.js.map