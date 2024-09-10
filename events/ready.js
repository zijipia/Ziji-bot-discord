const { Events, Client, ActivityType } = require('discord.js');
const config = require('../config');
const deploy = require('../deploy');
const mongoose = require('mongoose');

module.exports = {
  name: Events.ClientReady,
  type: 'events',
  once: true,
  /**
   *
   * @param { Client } client
   */
  execute: async client => {
    client.errorLog = async messenger => {
      try {
        const channel = await client.channels.fetch(config?.botConfig?.ErrorLog);
        if (channel) {
          const text = `[<t:${Math.floor(Date.now() / 1000)}:R>] ${messenger}`;
          for (let i = 0; i < text.length; i += 1000) {
            await channel.send(text.slice(i, i + 1000));
          }
        }
      } catch (error) {
        console.error('Lỗi khi gửi tin nhắn lỗi:', error);
      }
    };
    if (config.deploy) {
      await deploy(client);
    }
    if (process.env.MONGO) {
      await mongoose.connect(process.env.MONGO).then(() => {
        console.log('Connected to MongoDB!');
        client.errorLog(`Connected to MongoDB!`);
        client.db = require('./../utility/mongoDB');
      });
    }

    console.log(`Ready! Logged in as ${client.user.tag}`);
    client.user.setActivity({
      name: config?.botConfig?.ActivityName || 'ziji',
      type: ActivityType[config?.botConfig?.ActivityType] || ActivityType.Playing,
      timestamps: {
        start: Date.now(),
      },
    });
    client.user.setStatus(config?.Status || 'online');
    client.errorLog(`Ready! Logged in as ${client.user.tag}`);
  },
};
