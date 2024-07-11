const { useMainPlayer, useQueue } = require("discord-player");
const player = useMainPlayer()



module.exports.data = {
    name: "play",
    description: "Phát nhạc",
    type: 1,
    options: [{
        name: "query",
        description: "Tên bài hát",
        required: true,
        type: 3,
        autocomplete: true
    }],
    integration_types: [0],
    contexts: [0],
}

module.exports.execute = async (interaction) => {
    const query = interaction.options?.getString("query") || interaction.targetMessage.content;
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) return interaction.reply({ content: "Bạn chưa tham gia vào kênh thoại" });
    const voiceMe = interaction.guild.members.cache.get(interaction.client.user.id).voice.channel;
    if (voiceMe && voiceMe.id !== voiceChannel.id) return interaction.reply({ content: "Bot đã tham gia một kênh thoại khác" });
    await interaction.deferReply({ fetchReply: true })
    const queue = useQueue(interaction.guild.id)
    const res = await player.play(voiceChannel, query, {
        nodeOptions: {
            selfDeaf: true,
            volume: 100,
            leaveOnEmpty: true,
            leaveOnEmptyCooldown: 5000,
            leaveOnEnd: true,
            leaveOnEndCooldown: 500000,
            metadata: queue?.metadata || {
                channel: interaction.channel,
                requestedBy: interaction.user,
                mess: await interaction.fetchReply()
            }
        }
    })
    if (queue?.metadata) return interaction.deleteReply().catch(e => { })
    interaction.editReply(`Đã thêm bài hát: ${res.track.title}`)



}