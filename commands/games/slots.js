const { Slots } = require("discord-gamecord");

module.exports.data = {
	name: "slots",
	description: "Trò chơi slots",
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
	const Game = new Slots({
		message: interaction,
		isSlashGame: true,
		embed: {
			title: "Slot Machine",
			color: "#5865F2",
		},
		slots: ["🍇", "🍊", "🍋", "🍌"],
	});

	Game.startGame();
	Game.on("gameOver", (result) => {
		return;
	});
};
