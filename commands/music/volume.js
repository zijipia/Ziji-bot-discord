const { CommandInteraction } = require("discord.js");

module.exports.data = {
    name: "volume",
    description: "Chỉnh sửa âm lượng nhạc",
    type: 1,
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
module.exports.execute = async (interaction) => {
    await interaction.deferReply({ fetchReply: true })
    const volume = interaction.options.getInteger("query");
    const queue = useQueue(interaction.guild.id);
    if (queue) return interaction.editReply("Hiện không có bài hát nào đang phát");
    queue.node.setVolume(volume); //Pass the value for the volume here

}