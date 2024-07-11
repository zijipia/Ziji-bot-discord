const { useMainPlayer, useQueue } = require("discord-player")
module.exports.data = {
    name: "player_refresh",
    type: "button",
}

module.exports.execute = async (interaction) => {
    interaction.deferUpdate();
    const queue = useQueue(interaction.guild.id);
    if (!queue) return;
    const player = interaction.client.functions.get("player");

    if (!player) return;
    const res = await player.execute(interaction.client, queue)
    queue.metadata.mess.edit(res)
}