const { Schema, model } = require("mongoose");

const ZiUser = Schema({
	userID: { type: String },
	name: { type: String },
	xp: { type: Number },
	level: { type: Number, default: 1 },
	coin: { type: Number, default: 1 },
	lang: { type: String },
	volume: { type: Number, default: 100 },
	color: { type: String, default: "Random" },
});

const ZiAutoresponder = Schema(
	{
		guildId: { type: String, required: true },
		trigger: { type: String, required: true },
		response: { type: String, required: true },
		options: {
			matchMode: { type: String, enum: ["exactly", "startswith", "endswith", "includes"], default: "exactly" },
		},
	},
	{
		timestamps: true,
	},
);

const ZiWelcome = Schema(
	{
		guildId: { type: String, required: true },
		channel: { type: String, required: true },
		content: { type: String, required: true },
		Bchannel: { type: String, required: true },
		Bcontent: { type: String }, // Corrected duplicate
	},
	{
		timestamps: true,
	},
);

const ZiGuild = Schema({
	guildId: { type: String, required: true },
	voice: {
		logMode: { type: Boolean, default: false },
	},
	joinToCreate: {
		enabled: { type: Boolean, default: false },
		voiceChannelId: { type: String, default: null },
		categoryId: { type: String, default: null },
		defaultUserLimit: { type: Number, default: 0 },
		tempChannels: [
			{
				channelId: String,
				ownerId: String,
				locked: { type: Boolean, default: false },
			},
		],
		blockedUser: [String],
	},
});

module.exports = {
	ZiUser: model("ZiUser", ZiUser),
	ZiAutoresponder: model("ZiAutoresponder", ZiAutoresponder),
	ZiWelcome: model("ZiWelcome", ZiWelcome),
	ZiGuild: model("ZiGuild", ZiGuild),
};
