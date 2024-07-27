const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, BaseInteraction, BaseGuild } = require("discord.js");
const { useMainPlayer, useQueue, Util, useMetadata } = require("discord-player");

const player = useMainPlayer();

/**
 * Executes the command to edit metadata.
 * @param { BaseGuild } guild - The guild where the command is executed.
 * @param { Object } metadata - The metadata to update.
 */
module.exports.execute = async (guild, metadata) => {
    try {
        const [getMetadata, setMetadata] = useMetadata(guild?.id);
        const currentMetadata = getMetadata();

        setMetadata({
            channel: metadata?.channel || currentMetadata?.channel,
            requestedBy: metadata?.requestedBy || currentMetadata?.requestedBy,
            LockStatus: metadata?.LockStatus || currentMetadata?.LockStatus,
            mess: metadata?.mess || currentMetadata?.mess,
        });
    } catch (error) {
        console.error('Error updating metadata:', error);
    }
};

/**
 * Command data for EditMetadata.
 */
module.exports.data = {
    name: "EditMetadata",
    type: "player",
};
