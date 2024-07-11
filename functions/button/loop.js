const { useMainPlayer, useQueue } = require("discord-player")
module.exports.data = {
    name: "player_loop",
    type: "button",
}

module.exports.execute = async (interaction) => {
    interaction.deferUpdate();
    const queue = useQueue(interaction.guild.id);
    if (!queue) return;
    if (queue.repeatMode === 0) {
        queue.setRepeatMode(1);
    }
    else if (queue.repeatMode === 1) {
        queue.setRepeatMode(2);
    }
    else if (queue.repeatMode === 2) {
        queue.setRepeatMode(3);
    }
    else if (queue.repeatMode === 3) {
        queue.setRepeatMode(0);
    }
    const player = client.functions.get("player");
    queue.metadata.mess.edit(player)
}