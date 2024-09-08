const { Events, Client, ActivityType } = require('discord.js');
const config = require('../config');
const deploy = require('../deploy');
const mongoose = require('mongoose');

module.exports = {
  name: Events.ClientReady,
  type: 'events',
  /**
   *
   * @param { Client } client
   */
  execute: async client => {
    if (config.deploy) {
      await deploy(client);
    }
    if (process.env.MONGO) {
      await mongoose.connect(process.env.MONGO).then(() => {
        console.log('Connected to MongoDB!');
        client.db = require('./../utility/mongoDB');
      });
    }

    console.log(`Ready! Logged in as ${client.user.tag}`);
    client.user.setActivity({
      name: config?.ActivityName || 'ziji',
      type: ActivityType[config?.ActivityType] || ActivityType.Playing,
      timestamps: {
        start: Date.now(),
      },
    });
    client.user.setStatus(config?.Status || 'online');
  },
};
