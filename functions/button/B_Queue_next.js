const { useQueue } = require("discord-player");
const { useFunctions } = require("@zibot/zihooks");

module.exports.data = {
	name: "B_queue_next",
	type: "button",
};

/**
 * @param { object } button - object button
 * @param { import ("discord.js").ButtonInteraction } button.interaction - button interaction
 * @param { import('../../lang/vi.js') } button.lang - language
 * @returns
 */

module.exports.execute = async ({ interaction, lang }) => {
	const queue = useQueue(interaction.guild.id);
	const QueueTrack = useFunctions().get("Queue");
	QueueTrack.execute(interaction, queue, true);
	return;
};
