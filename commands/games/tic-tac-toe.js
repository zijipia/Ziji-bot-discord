const { TicTacToe } = require("discord-gamecord");

module.exports.data = {
	name: "tic-tac-toe",
	description: "Chơi trò chơi cờ caro (tic-tac-toe)",
	type: 1, // slash command
	options: [
		{
			name: "opponent",
			description: "Đối thủ của trò chơi",
			type: 6,
			required: true,
		},
	],
	integration_types: [0],
	contexts: [0, 1],
};

/**
 * @param { object } command - object command
 * @param { import ("discord.js").CommandInteraction } command.interaction - interaction
 * @param { import('../../lang/vi.js') } command.lang - language
 */
module.exports.execute = async ({ interaction, lang }) => {
	const Game = new TicTacToe({
		message: interaction,
		isSlashGame: true,
		opponent: interaction.options.getUser("opponent"),
		embed: {
			title: "Trò chơi cờ Caro",
			color: "#ffcc99",
			statusTitle: "Trạng thái",
			overTitle: "Trò chơi kết thúc",
		},
		emojis: {
			xButton: "❌",
			oButton: "🔵",
			blankButton: "➖",
		},
		mentionUser: true,
		timeoutTime: 60000,
		xButtonStyle: "DANGER",
		oButtonStyle: "PRIMARY",
		mentionUser: true,
		timeoutTime: 60000,
		xButtonStyle: "DANGER",
		oButtonStyle: "PRIMARY",
		turnMessage: lang.TicTacToe.turnMessage,
		winMessage: lang.TicTacToe.winMessage,
		tieMessage: lang.TicTacToe.tieMessage,
		timeoutMessage: lang.TicTacToe.timeoutMessage,
		playerOnlyMessage: lang.TicTacToe.playerOnlyMessage,
	});

	Game.startGame();
	Game.on("gameOver", (result) => {
		return;
	});
};
