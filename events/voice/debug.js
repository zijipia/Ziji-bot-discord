const config = require("@zibot/zihooks").useConfig();

module.exports = {
	name: "debug",
	type: "voiceExtractor",
	enable: config.DevConfig.voiceExt_DEBUG,

	execute: async (debug) => {
		console.log(debug);
	},
};
