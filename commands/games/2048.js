const { TwoZeroFourEight } = require("discord-gamecord");
const icons = require("../../utility/icon");

module.exports.data = {
	name: "2048",
	description: "Trò chơi giải đố",
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
	const Game = new TwoZeroFourEight({
		message: interaction,
		isSlashGame: true,
		embed: {
			title: "2048",
			color: "#5865F2",
		},
		emojis: {
			up: `${icons.up}`,
			down: `${icons.down}`,
			left: `${icons.left}`,
			right: `${icons.right}`,
		},
		timeoutTime: 60000,
		buttonStyle: "SECONDARY",
		playerOnlyMessage: "Only {player} can use these buttons.",
	});

	Game.startGame();
	Game.on("gameOver", (result) => {
		return;
	});
};
