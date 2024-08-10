const { useMainPlayer, useQueue } = require("discord-player");
const { ButtonInteraction } = require("discord.js");
const player = useMainPlayer();
module.exports.data = {
    name: "player_stop",
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
    if (!queue) return interaction.message.edit({ components: [] }).catch(e => { });
    if (queue.metadata.LockStatus && queue.metadata.requestedBy?.id !== interaction.user?.id) return;
    interaction.message.edit({ components: [] }).catch(e => { })
    queue.delete();
}