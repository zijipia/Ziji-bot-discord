// const { useMainPlayer, useQueue } = require('discord-player');
// const { CommandInteraction } = require('discord.js');
// const player = useMainPlayer();
// const { joinVoiceChannel } = require('discord-voip');
// module.exports.data = {
//   name: 'connect',
//   description: 'Kết nối đến kênh thoại',
//   type: 1, // slash commad
//   options: [],
//   integration_types: [0],
//   contexts: [0],
// };
// /**
//  *
//  * @param { CommandInteraction } interaction
//  */
// module.exports.execute = async (interaction, lang) => {
//   const voiceChannel = interaction.member?.voice.channel;
//   if (voiceChannel) {
//     joinVoiceChannel({
//       channelId: voiceChannel.id,
//       guildId: voiceChannel.guild.id,
//       adapterCreator: voiceChannel.guild.voiceAdapterCreator,
//       selfDeaf: false,
//     });
//   }
// };
