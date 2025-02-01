const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
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
			allowedHeaders: ["Content-Type"],
		}),
	);
	server.listen(process.env.SERVER_PORT || 2003, () => {
		logger.info(`Server running on port ${process.env.SERVER_PORT || 2003}`);
	});

	app.get("/api/search", async (req, res) => {
		try {
			const { query } = req.query;
			if (!query) {
				return res.status(400).json({ error: "Search query is required" });
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

	const io = new Server(server, {
		cors: {
			methods: ["GET", "POST"],
			origin: "*",
		},
	});

	io.on("connection", async (socket) => {
		logger.info(`[Socket ${socket.id}] connected.`);

		let user = null;
		let queue = null;

		socket.on("error", (error) => {
			logger.error("WebSocket error:", error);
		});

		socket.on("disconnect", () => {
			logger.info("WebSocket client disconnected");
		});

		socket.on("GetVoice", async (userID) => {
			try {
				user = await client.users.fetch(userID);

				const userQueue = player.queues.cache.find((node) => {
					return node.metadata?.listeners.includes(user);
				});

				if (userQueue?.connection) {
					queue = userQueue;
					socket.emit("ReplyVoice", {
						channel: queue.metadata.channel,
						guild: queue.metadata.channel.guild,
					});
				}
			} catch (error) {
				logger.error("Error in GetVoice:", error);
			}
		});

		socket.on("pause", async () => {
			try {
				if (!queue) return;
				await queue.node.setPaused(!queue.node.isPaused());
			} catch (error) {
				logger.error("Error in pause command:", error);
			}
		});

		socket.on("play", async ({ trackUrl }) => {
			console.log(trackUrl);
			try {
				if (!queue) return;
				await queue.play(trackUrl);
			} catch (error) {
				logger.error("Error in pause command:", error);
			}
		});

		socket.on("skip", async () => {
			try {
				if (!queue) return;
				await queue.node.skip();
			} catch (error) {
				logger.error("Error in skip command:", error);
			}
		});

		socket.on("back", async () => {
			try {
				if (!queue) return;
				const previousTrack = queue.history;
				if (previousTrack) {
					previousTrack.previous();
				}
			} catch (error) {
				logger.error("Error in back command:", error);
			}
		});

		socket.on("volume", async (data) => {
			try {
				if (!queue) return;
				await queue.node.setVolume(Number(data.volume));
			} catch (error) {
				logger.error("Error in volume command:", error);
			}
		});

		socket.on("loop", async ({ mode }) => {
			try {
				if (!queue) return;
				await queue.setRepeatMode(Number(mode));
			} catch (error) {
				logger.error("Error in loop command:", error);
			}
		});

		socket.on("shuffle", async () => {
			try {
				if (!queue) return;
				await queue.tracks.shuffle();
			} catch (error) {
				logger.error("Error in shuffle command:", error);
			}
		});

		socket.on("filter", async (filter) => {
			try {
				if (!queue) return;
				await queue.filters.ffmpeg.toggle(filter);
			} catch (error) {
				logger.error("Error in filter command:", error);
			}
		});

		socket.on("filter", async (filter) => {
			try {
				if (!queue) return;
				await queue.filters.ffmpeg.toggle(filter);
			} catch (error) {
				logger.error("Error in filter command:", error);
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
				const query = (
					queue?.currentTrack?.cleanTitle ||
					queue?.currentTrack?.title ||
					"891275176409460746891275176409460746891275176409460746"
				)
					.toLowerCase()
					.replace(/lyrics|MV|Full/g, "")
					.replace("ft", "feat");

				const lyrics = await player.lyrics.search({ q: query });
				const currentTrack =
					queue.currentTrack ?
						{
							title: queue.currentTrack.title,
							url: queue.currentTrack.url,
							duration: queue.currentTrack.duration,
							thumbnail: queue.currentTrack.thumbnail,
							lyrics,
						}
					:	null;

				socket.emit("statistics", {
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
				});
			} catch (error) {
				logger.error("Error in statistics handler:", error);
			}
		};

		const statsInterval = setInterval(sendStatistics, 1000);
		sendStatistics();

		socket.once("disconnect", () => {
			clearInterval(statsInterval);
		});
	});
}

module.exports = { startServer };
