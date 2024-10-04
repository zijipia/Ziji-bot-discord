const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuInteraction } = require('discord.js');
const { useMainPlayer, useQueue, Util } = require('discord-player');

const player = useMainPlayer();

/**
 * Executes the command to edit metadata.
 * @param { StringSelectMenuInteraction } interaction - The guild where the command is executed.
 * @param { Object } options - The metadata to update.
 * @param { String } options.query - The Query search lyrics
 * @param { String } options.type - The type of lyrics syncedLyrics or plainLyrics
 */

module.exports.execute = async (interaction, options) => {
  const queue = useQueue(interaction.guild.id);
  const LyricsEmbed = new EmbedBuilder().setDescription('❌ | No Lyrics Found!').setColor('Random');
  const query =
    options?.query ||
    queue.currentTrack.cleanTitle.replace(/lyrics|Full/g, '') ||
    queue.currentTrack.title ||
    '891275176409460746891275176409460746891275176409460746';

  if (options?.type !== 'syncedLyrics') {
    const lyrics = await player.lyrics.search({ q: query });

    if (!lyrics.length) return interaction.followUp({ embeds: [LyricsEmbed], ephemeral: true });

    const trimmedLyrics = lyrics[0].plainLyrics.substring(0, 1997);
    const embed = LyricsEmbed.setTitle(`${lyrics[0]?.trackName} - ${lyrics[0]?.artistName}`).setDescription(
      trimmedLyrics.length === 1997 ? `${trimmedLyrics}...` : trimmedLyrics,
    );

    return interaction.editReply({ embeds: [embed] }).catch(async () => {
      await interaction.followUp({ embeds: [embed] }).catch(() => {});
    });
  }

  if (!queue) return;

  const lyrics = await player.lyrics.search({ q: query });
  if (!lyrics?.at(0)?.syncedLyrics) return;

  const syncedLyrics = queue.syncedLyrics(lyrics.at(0));

  let current_Lyric = '',
    previous_Lyric = '',
    pre_previous_Lyric = '';
  syncedLyrics.onChange(async (lyricss, timestamp) => {
    current_Lyric = `[${Util.buildTimeCode(Util.parseMS(timestamp))}]: ${lyricss}`;
    const embed = LyricsEmbed.setTitle(`${lyrics[0]?.trackName} - ${lyrics[0]?.artistName}`).setDescription(
      `${pre_previous_Lyric}\n${previous_Lyric}\n${current_Lyric}.`,
    );
    pre_previous_Lyric = previous_Lyric;
    previous_Lyric = current_Lyric;
    await queue.metadata.ZiLyrics?.mess.edit({ embeds: [embed] }).catch(async () => {
      await queue.metadata.ZiLyrics?.channel.send({ embeds: [embed] }).catch(() => {});
    });
  });

  queue.metadata.ZiLyrics.unsubscribe = syncedLyrics.subscribe();
  return;
};

/**
 * Command data for Lyrics.
 */

module.exports.data = {
  name: 'Lyrics',
  type: 'player',
};
