const { useMainPlayer, useQueue } = require("discord-player");
const { ButtonInteraction } = require("discord.js");
const player = useMainPlayer();
module.exports.data = {
    name: "queue_next",
    type: "button",
}
/**
 * 
 * @param { ButtonInteraction } interaction 
 * @returns 
 */
module.exports.execute = async (interaction, lang) => {
    const queue = useQueue(interaction.guild.id);
    const QueueTrack = interaction.client.functions.get("Queue");
    QueueTrack.execute(interaction, queue, true);
    return;
}