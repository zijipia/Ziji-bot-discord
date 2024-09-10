const { CommandInteraction, PermissionsBitField } = require('discord.js');
const ms = require('ms');
module.exports.data = {
  name: 'ga-start',
  description: 'Bắt đầu một giveaway',
  type: 1, // slash command
  options: [
    {
      name: 'duration',
      description: 'Thời gian của giveaway',
      type: 3,
      required: true,
    },
    {
      name: 'winners',
      description: 'Số người thắng',
      type: 4,
      required: true,
    },
    {
      name: 'prize',
      description: 'Phần thưởng của giveaway',
      type: 3,
      required: true,
    },
    {
      name: 'channel',
      description: 'Kênh diễn ra giveaway',
      type: 7,
      required: false,
    },
  ],
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};
/**
 *
 * @param { CommandInteraction } interaction
 */
module.exports.execute = async (interaction, lang) => {
  if (
    !interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages) &&
    interaction.user.id !== interaction.client.user.id
  ) {
    return interaction.reply({ content: lang?.until?.notHavePremission, ephemeral: true });
  }
  const duration = interaction.options.getString('duration');
  const winnerCount = interaction.options.getInteger('winners');
  const prize = interaction.options.getString('prize');
  const channel = interaction.options.getChannel('channel') || interaction.channel;
  if (!channel.isTextBased()) {
    return interaction.reply({ content: lang?.Giveaways?.notTextChannel, ephemeral: true });
  }
  await interaction.client.giveaway.start(channel, {
    duration: ms(duration),
    winnerCount,
    prize,
    hostedBy: interaction.user,
    thumbnail: interaction.user.displayAvatarURL(),
    messages: {
      giveaway: lang?.Giveaways?.giveaway,
      giveawayEnded: lang?.Giveaways?.giveawayEnded,
      title: lang?.Giveaways?.title,
      drawing: lang?.Giveaways?.drawing,
      inviteToParticipate: lang?.Giveaways?.inviteToParticipate,
      hostedBy: lang?.Giveaways?.hostedBy,
      dropMessage: lang?.Giveaways?.dropMessage,
      winMessage: lang?.Giveaways?.winMessage,
      embedFooter: lang?.Giveaways?.embedFooter,
      noWinner: lang?.Giveaways?.noWinner,
      winners: lang?.Giveaways?.winners,
      endedAt: lang?.Giveaways?.endedAt,
    },
  });
  return interaction.reply({ content: `${lang?.Giveaways?.notify} ${channel}`, ephemeral: true });
};
