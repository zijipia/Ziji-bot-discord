const config = require("@zibot/zihooks").useConfig();

module.exports = {
	name: "debug",
	type: "voiceExtractor",
	// enable: config.DevConfig.voiceExt_DEBUG,
	enable: false, //v7 not support

	execute: async (debug) => {
		console.log(debug);
	},
};
