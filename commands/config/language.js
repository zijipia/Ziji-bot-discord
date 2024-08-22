const { CommandInteraction } = require("discord.js");

module.exports.data = {
    name: "language",
    description: "Chỉnh sửa ngôn ngữ bot",
    type: 1, // slash commad
    options: [{
        name: "lang",
        description: "Chọn ngôn ngữ",
        type: 3, // string
        required: true,
        choices: [
            { name: "Tiếng Việt", value: "vi" },
            { name: "English", value: "en" },
        ]
    }],
    integration_types: [0],
    contexts: [0],
}
/**
 * 
 * @param { CommandInteraction } interaction 
 */
module.exports.execute = async (interaction, lang) => {
    const { client, guild } = interaction
    await interaction.deferReply();
    const langcode = interaction.options.getString("lang");
    if (!client?.db) return interaction.editReply({ content: lang?.until?.noDB || "Database hiện không được bật, xin vui lòng liên hệ dev bot" })
    await client.db.ZiUser.updateOne(
        { userID: interaction.user.id },
        {
            $set: {
                lang: langcode,
            }
        },
        { upsert: true }
    );
    const langfunc = client.functions.get("ZiRank");
    const lang2 = await langfunc.execute(client, interaction.user, 0);
    interaction.editReply({ content: `${lang2.until.langChange} ${lang2.until.name}` });
}