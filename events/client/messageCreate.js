const { Events, Message } = require("discord.js");
module.exports = {
	name: Events.MessageCreate,
	type: "events",
};
/**
 * @param { Message } message
 */

module.exports.execute = async (message) => {
    if (message.author.bot) return;

    const guildResponders = message.client.autoRes.get(message.guild.id) || [];

    const trigger = guildResponders.find((responder) => {
      switch (responder.matchMode) {
        case 'exactly':
          return message.content === responder.trigger;
        case 'startswith':
          return message.content.startsWith(responder.trigger);
        case 'endswith':
          return message.content.endsWith(responder.trigger);
        case 'includes':
          return message.content.includes(responder.trigger);
        default:
          return message.content === responder.trigger
      }
    });

    if (trigger) {
      message.reply(trigger.response);
    }
}