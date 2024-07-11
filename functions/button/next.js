const { useMainPlayer, useQueue } = require("discord-player")
const player = useMainPlayer();
module.exports.data = {
    name: "player_next",
    type: "button",
}

module.exports.execute = async (interaction) => {
    interaction.deferUpdate();
    const queue = useQueue(interaction.guild.id);
    if (!queue) return;
    queue.node.skip();
}