const { useQueue } = require("discord-player");
const { CommandInteraction } = require("discord.js");

module.exports.data = {
    name: "volume",
    description: "Chỉnh sửa âm lượng nhạc",
    type: 1, // slash commad
    options: [{
        name: "vol",
        description: "Nhập âm lượng",
        required: true,
        type: 4,
        min_value: 0,
        max_value: 100
    }],
    integration_types: [0],
    contexts: [0],
}
/**
 * 
 * @param { CommandInteraction } interaction 
 */
module.exports.execute = async (interaction, lang) => {
    await interaction.deferReply({ fetchReply: true })
    const volume = interaction.options.getInteger("vol");
    const queue = useQueue(interaction.guild.id);
    if (!queue) return interaction.editReply("Hiện không có bài hát nào đang phát");
    queue.node.setVolume(Math.floor(volume)); //Pass the value for the volume here
    await interaction.deleteReply().catch(e => { });
    const player = interaction.client.functions.get("player_func");
    if (!player) return;
    const res = await player.execute(interaction.client, queue)
    return queue.metadata.mess.edit(res);
}