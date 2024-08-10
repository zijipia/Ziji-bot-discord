const { useMainPlayer, useQueue } = require("discord-player");
const { ButtonInteraction } = require("discord.js");
const player = useMainPlayer();
module.exports.data = {
    name: "queue_clear",
    type: "button",
}
/**
 * 
 * @param { ButtonInteraction } interaction 
 * @returns 
 */
module.exports.execute = async (interaction, lang) => {
    const queue = useQueue(interaction.guild.id);
    if (!queue) return;
    queue.clear();
    interaction.message.delete().catch(e => { })
    return;
}