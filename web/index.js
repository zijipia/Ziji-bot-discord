const express = require("express");
const cors = require("cors");
const { WebSocketServer } = require("ws");
const { useClient, useLogger, useConfig } = require("@zibot/zihooks");
const { useMainPlayer } = require("discord-player");
const http = require("http");

async function startServer() {
	const logger = useLogger();
	const client = useClient();
	const player = useMainPlayer();

	const app = express();
	const server = http.createServer(app);
	app.use(
		cors({
			origin: "*",
			methods: ["GET", "POST"],
			credentials: true,
		}),
	);
	server.listen(process.env.SERVER_PORT || 2003, () => {
		logger.info(`Server running on port ${process.env.SERVER_PORT || 2003}`);
	});

	app.get("/", (req, res) => {
		res.json({ status: "healthy", content: "Welcome to API!", clientName: client.user.displayName, clientId: client.user.id });
	});

	app.get("/api/search", async (req, res) => {
		try {
			const { query } = req.query || req.q;
			if (!query) {
				return res.status(400).json({ error: "Search query is required! Use /api/search?q=<input>" });
			}

			const searchResults = await player.search(query, {
				requestedBy: client.user,
				searchEngine: useConfig().botConfig.QueryType,
			});

			res.json(searchResults.tracks.slice(0, 10));
		} catch (error) {
			logger.error("Search error:", error);
			res.status(500).json({ error: "An error occurred during search" });
		}
	});

	const wss = new WebSocketServer({ server });

	wss.on("connection", (ws) => {
		logger.debug("[WebSocket] Client connected.");

		let user = null;
		let queue = null;

		ws.on("message", async (message) => {
			try {
				const data = JSON.parse(message);
				switch (data.type) {
					case "GetVoice":
						user = await client.users.fetch(data.userID);
						const userQueue = player.queues.cache.find((node) => node.metadata?.listeners.includes(user));
						if (userQueue?.connection) {
							queue = userQueue;
							ws.send(
								JSON.stringify({ type: "ReplyVoice", channel: queue.metadata.channel, guild: queue.metadata.channel.guild }),
							);
						}
						break;
					case "pause":
						if (queue) await queue.node.setPaused(!queue.node.isPaused());
						break;
					case "play":
						if (queue) await queue.play(data.trackUrl);
						break;
					case "skip":
						if (queue) await queue.node.skip();
						break;
					case "back":
						if (queue && queue.history) queue.history.previous();
						break;
					case "volume":
						if (queue) await queue.node.setVolume(Number(data.volume));
						break;
					case "loop":
						if (queue) await queue.setRepeatMode(Number(data.mode));
						break;
					case "shuffle":
						if (queue) await queue.tracks.shuffle();
						break;
					case "filter":
						if (queue) await queue.filters.ffmpeg.toggle(data.filter);
						break;
				}
			} catch (error) {
				logger.error("WebSocket message error:", error);
			}
		});

		const sendStatistics = async () => {
			if (!queue?.connection) return;
			try {
				const queueTracks = queue.tracks.map((track) => ({
					title: track.title,
					url: track.url,
					duration: track.duration,
					thumbnail: track.thumbnail,
				}));

				const currentTrack =
					queue.currentTrack ?
						{
							title: queue.currentTrack.title,
							url: queue.currentTrack.url,
							duration: queue.currentTrack.duration,
							thumbnail: queue.currentTrack.thumbnail,
						}
					:	null;

				ws.send(
					JSON.stringify({
						type: "statistics",
						timestamp: {
							current: queue.node.getTimestamp(),
							total: queue.currentTrack?.durationMS,
						},
						listeners: queue.metadata?.channel?.members.filter((mem) => !mem.user.bot).size ?? 0,
						tracks: queue.tracks.size,
						volume: queue.node.volume,
						paused: queue.node.isPaused(),
						repeatMode: queue.repeatMode,
						track: currentTrack,
						queue: queueTracks,
						filters: queue.filters.ffmpeg.getFiltersEnabled(),
						shuffle: queue.tracks.shuffled,
					}),
				);
			} catch (error) {
				logger.error("Error in statistics handler:", error);
			}
		};

		const statsInterval = setInterval(sendStatistics, 1000);
		sendStatistics();

		ws.on("close", () => {
			logger.debug("[WebSocket] Client disconnected.");
			clearInterval(statsInterval);
		});
	});
}

module.exports = { startServer };
