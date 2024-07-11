const { useMainPlayer, useQueue } = require("discord-player")
const player = useMainPlayer();
module.exports.data = {
    name: "player_stop",
    type: "button",
}

module.exports.execute = async (interaction) => {
    interaction.deferUpdate();
    interaction.message.edit({ components: [] }).catch(e => { })
    const queue = useQueue(interaction.guild.id);
    if (!queue) return;
    queue.delete();

}