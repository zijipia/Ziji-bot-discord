const { MessageContextMenuCommandInteraction, EmbedBuilder } = require("discord.js");
const translate = require('@iamtraction/google-translate');

module.exports.data = {
    name: "Translate",
    type: 3, // context
    options: [],
    integration_types: [0, 1],
    contexts: [0, 1],
}
/**
 * 
 * @param { MessageContextMenuCommandInteraction } interaction 
 */
module.exports.execute = async (interaction, lang) => {
    await interaction.deferReply();
    const { client, targetMessage, user } = interaction;
    const res = { content: "" };
    if (targetMessage.content) {
        const content = await translate(targetMessage.content, { to: lang?.name || 'en' });
        res.content = `${content.text}`;
    }
    if (targetMessage.embeds) {
        const revembed = targetMessage.embeds?.at(0)?.data
        const embed = new EmbedBuilder()
            .setFooter({
                text: `${lang.until.requestBy} ${user?.username}`,
                iconURL: user.displayAvatarURL({ size: 1024 })
            })
            .setTimestamp();

        if (revembed?.thumbnail?.url)
            embed.setThumbnail(revembed?.thumbnail?.url)
        if (revembed?.image?.url)
            embed.setImage(revembed?.image?.url)
        if (revembed?.color)
            embed.setColor(revembed?.color)


        if (revembed.description) {
            const descriptions = await translate(revembed.description, { to: lang?.name || 'en' });
            embed.setDescription(descriptions.text);
        }
        if (revembed.title) {
            const titles = await translate(revembed.title, { to: lang?.name || 'en' });
            embed.setTitle(titles.text);
        }
        if (revembed.fields) {
            for (const field of revembed.fields) {
                const fieldname = await translate(field.name, { to: lang?.name || 'en' });
                const fields = await translate(field.value, { to: lang?.name || 'en' });
                embed.addFields({ name: fieldname.text, value: fields.text, inline: field.inline });
            }
        }

        res.embeds = [embed];
    }
    await interaction.editReply(res);
    return
}