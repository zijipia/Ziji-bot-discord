const { Events } = require("discord.js");

module.exports = {
	name: Events.Raw,
	type: "events",
	enable: false,

	/**
	 * @param { Object } packet
	 */
	execute: async (packet) => {
		console.log(packet);
	},
};
