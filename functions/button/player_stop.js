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
module.exports.execute = async (interaction) => {
    interaction.deferUpdate();
    interaction.message.edit({ components: [] }).catch(e => { })
    const queue = useQueue(interaction.guild.id);
    if (!queue) return;
    queue.delete();

}