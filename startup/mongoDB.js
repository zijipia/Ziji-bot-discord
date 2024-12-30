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

const ZiAutoresopnder = Schema(
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
		Bcontent: { type: String, required: true },
		Bcontent: { type: String, required: true },
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
});

module.exports = {
	ZiUser: model("ZiUser", ZiUser),
	ZiAutoresponder: model("ZiAutoresponder", ZiAutoresopnder),
	ZiWelcome: model("ZiWelcome", ZiWelcome),
	ZiGuild: model("ZiGuild", ZiGuild),
};
