// function/logger.js
const chalk = require("chalk");

class Logger {
	constructor() {
		this.levels = {
			debug: chalk.blue, // Màu xanh dương cho debug
			info: chalk.green, // Màu xanh lá cho info
			warn: chalk.yellow, // Màu vàng cho warn
			error: chalk.red, // Màu đỏ cho error
		};
	}

	// Hàm tạo timestamp
	getTimestamp() {
		return new Date().toISOString();
	}

	// Hàm chung để log với các mức độ khác nhau
	log(level, message) {
		if (!this.levels[level]) {
			throw new Error(`Invalid log level: ${level}`);
		}

		const timestamp = this.getTimestamp();
		const color = this.levels[level]; // Chọn màu tương ứng
		console.log(color(`[${timestamp}] <${level.toLowerCase()}>: ${message}`));
	}

	// Các hàm cụ thể cho từng mức độ log
	debug(message) {
		this.log("debug", message);
	}

	info(message) {
		this.log("info", message);
	}

	warn(message) {
		this.log("warn", message);
	}

	error(message) {
		this.log("error", message);
	}
}

module.exports = Logger;
