const { useMainPlayer, useQueue } = require("discord-player");
const { ButtonInteraction } = require("discord.js");
module.exports.data = {
    name: "player_refresh",
    type: "button",
}
/**
 * 
 * @param { ButtonInteraction } interaction 
 * @returns 
 */
module.exports.execute = async (interaction, lang) => {
    interaction.deferUpdate();
    const queue = useQueue(interaction.guild.id);
    if (!queue) return;
    const player = interaction.client.functions.get("player_func");

    if (!player) return;
    const res = await player.execute(interaction.client, queue)
    queue.metadata.mess.edit(res)
}