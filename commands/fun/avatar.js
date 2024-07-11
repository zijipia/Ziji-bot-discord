// const { User } = require("discord.js");



module.exports.data = {
    name: "avatar",
    description: "Xem ảnh đại diện của ai đó",
    type: 1,
    options: [{
        name: "user",
        description: "Chọn người dùng để xem avatar",
        type: 6,
        required: false
    }],
    integration_types: [0, 1],
    contexts: [0, 1, 2],
}

module.exports.execute = async (interaction) => {
    const user = interaction.options.getUser("user") || interaction.user

    interaction.reply(user.displayAvatarURL({ size: 1024 }));
    return;
}