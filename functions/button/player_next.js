const { useMainPlayer, useQueue } = require("discord-player");
const { ButtonInteraction } = require("discord.js");
const player = useMainPlayer();
module.exports.data = {
    name: "player_next",
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
    queue.node.skip();
}