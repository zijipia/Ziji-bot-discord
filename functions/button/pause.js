const { useMainPlayer, useQueue } = require("discord-player");
const { ButtonInteraction } = require("discord.js");
module.exports.data = {
    name: "player_pause",
    type: "button",
}
/**
 * 
 * @param { ButtonInteraction } interaction 
 * @returns 
 */
module.exports.execute = async (interaction) => {
    interaction.deferUpdate();
    const queue = useQueue(interaction.guild.id);
    if (!queue) return;
    queue.node.setPaused(queue.isPlaying())

    const player = interaction.client.functions.get("player");

    if (!player) return;
    const res = await player.execute(interaction.client, queue)
    queue.metadata.mess.edit(res)

}