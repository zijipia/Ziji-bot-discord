const { FastType } = require("discord-gamecord");
const { sentence } = require("txtgen/dist/cjs/txtgen.js");
module.exports.data = {
	name: "fast-type",
	description: "Kiểm tra trình độ gõ của bạn",
	type: 1, // slash command
	integration_types: [0],
	contexts: [0, 1],
};
/**
 * @param { object } command - object command
 * @param { import ("discord.js").CommandInteraction } command.interaction - interaction
 * @param { import('../../lang/vi.js') } command.lang - language
 */
module.exports.execute = async ({ interaction, lang }) => {
	const sent = sentence();
	const Game = new FastType({
		message: interaction,
		isSlashGame: true,
		embed: {
			title: "Fast Type",
			color: "#5865F2",
			description: "You have {time} seconds to type the sentence below.",
		},
		timeoutTime: 120000,
		sentence: sent,
		winMessage: "Bạn đã thắng với thời gian là {time} giây và wpm là {wpm}.",
		loseMessage: "Bạn đã thua!",
	});

	Game.startGame();
	Game.on("gameOver", (result) => {
		return;
	});
};
