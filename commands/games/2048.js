const { TwoZeroFourEight } = require('discord-gamecord');

module.exports.data = {
	name: "2048",
	description: "Trò chơi giải đố",
	type: 1, // slash command
	integration_types: [0, 1],
	contexts: [0, 1, 2],
};
/**
 * @param { object } command - object command
 * @param { import ("discord.js").CommandInteraction } command.interaction - interaction
 * @param { import('../../lang/vi.js') } command.lang - language
 */
module.exports.execute = async ({
	interaction,
	lang
}) => {
	const Game = new TwoZeroFourEight({
		message: interaction,
		isSlashGame: true,
		embed: {
			title: '2048',
			color: '#5865F2'
		},
		emojis: {
			up: '⬆️',
			down: '⬇️',
			left: '⬅️',
			right: '➡️',
		},
		timeoutTime: 60000,
		buttonStyle: 'PRIMARY',
		playerOnlyMessage: 'Only {player} can use these buttons.'
	});

	Game.startGame();
	Game.on('gameOver', result => {
		return;
	});
}