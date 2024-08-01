const { useMainPlayer, useQueue } = require("discord-player");
const { ButtonInteraction } = require("discord.js");
const player = useMainPlayer();
module.exports.data = {
    name: "queue_refresh",
    type: "button",
}
/**
 * 
 * @param { ButtonInteraction } interaction 
 * @returns 
 */
module.exports.execute = async (interaction) => {
    const queue = useQueue(interaction.guild.id);
    const QueueTrack = interaction.client.functions.get("Queue");
    interaction.message.embeds[0].data.fields[0].value = "﹏";
    QueueTrack.execute(interaction, queue, true);
    return;
}