
module.exports.data = {
    name: "cancel",
    type: "button",
}

module.exports.execute = async (interaction) => {
    interaction.message.delete().catch(e => { })
    return;
}