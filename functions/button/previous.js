const { useMainPlayer, useQueue } = require("discord-player")
const player = useMainPlayer();
module.exports.data = {
    name: "player_previous",
    type: "button",
}

module.exports.execute = async (interaction) => {
    const queue = useQueue(interaction.guild.id);
    if (!queue) return;

}