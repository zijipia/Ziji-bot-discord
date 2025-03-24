const { table } = require("table");
const fs = require("fs").promises;
const chalk = require("chalk");
const path = require("node:path");
const config = require("@zibot/zihooks").useConfig();

// Hàm loadFiles để tải các file lệnh từ thư mục chỉ định
const loadFiles = async (directory, collection) => {
	try {
		// Đọc danh sách thư mục con trong thư mục chỉ định
		const folders = await fs.readdir(directory);
		const clientCommands = [];

		// Duyệt qua từng thư mục con
		await Promise.all(
			folders.map(async (folder) => {
				const folderPath = path.join(directory, folder);
				// Lọc các file có đuôi .js
				const files = await fs.readdir(folderPath).then((files) => files.filter((file) => file.endsWith(".js")));

				// Duyệt qua từng file .js
				await Promise.all(
					files.map(async (file) => {
						const filePath = path.join(folderPath, file);
						try {
							// Tải module từ file
							const module = require(path.resolve(filePath));
							// Kiểm tra module có thuộc tính 'data' và 'execute'
							if ("data" in module && "execute" in module) {
								const isDisabled = config.disabledCommands.includes(module.data.name) || module.data?.enable === false;
								// Thêm thông tin lệnh vào danh sách
								clientCommands.push([chalk.hex(isDisabled ? "#4733FF" : "#E5C3FF")(module.data.name), isDisabled ? "❌" : "✅"]);
								// Nếu lệnh không bị vô hiệu hóa, thêm vào collection
								if (!isDisabled) collection.set(module.data.name, module);
							} else {
								// Thông báo nếu thiếu thuộc tính
								clientCommands.push([chalk.hex("#FF5733")(file), "❌"]);
								console.warn(`Module from ${file} is missing 'data' or 'execute' property.`);
							}
						} catch (moduleError) {
							// Xử lý lỗi khi tải module
							console.error(`Error loading command from file ${file}:`, moduleError);
							clientCommands.push([chalk.hex("#FF5733")(file), "❌"]);
						}
					}),
				);
			}),
		);

		// Hiển thị bảng thông tin các lệnh đã tải
		console.log(
			table(clientCommands, {
				header: {
					alignment: "center",
					content: `${path.basename(directory)}`,
				},
				singleLine: true,
				columns: [{ width: 25 }, { width: 5, alignment: "center" }],
			}),
		);
	} catch (dirError) {
		// Xử lý lỗi khi đọc thư mục
		console.error(`Error reading directory ${directory}:`, dirError);
	}
};

// Hàm loadEvents để tải các file Events từ thư mục chỉ định
const loadEvents = async (directory, target) => {
	const clientEvents = [];

	// Hàm đệ quy để tải file Events
	const loadEventFiles = async (dir) => {
		const files = await fs.readdir(dir, { withFileTypes: true });

		await Promise.all(
			files.map(async (file) => {
				const filePath = path.join(dir, file.name);

				if (file.isDirectory()) {
					// Nếu là thư mục, gọi đệ quy
					await loadEventFiles(filePath);
				} else if (file.isFile() && file.name.endsWith(".js")) {
					try {
						// Tải module Events từ file
						const event = require(path.resolve(filePath));

						const isDisabled = event?.enable === false;

						clientEvents.push([chalk.hex(isDisabled ? "#4733FF" : "#E5C3FF")(event.name), isDisabled ? "❌" : "✅"]);

						if (isDisabled) return;

						// Định nghĩa hàm xử lý Events
						const eventHandler = async (...args) => {
							try {
								await event.execute(...args);
							} catch (executeError) {
								console.error(`Error executing event ${event.name}:`, executeError);
							}
						};
						// Đăng ký Events với target
						target[event.once ? "once" : "on"](event.name, eventHandler);
					} catch (loadError) {
						// Xử lý lỗi khi tải Events
						console.error(`Error loading event from file ${file.name}:`, loadError);
						clientEvents.push([chalk.hex("#FF5733")(file.name), "❌"]);
					}
				}
			}),
		);
	};

	await loadEventFiles(directory);

	// Hiển thị bảng thông tin các Events đã tải
	console.log(
		table(clientEvents, {
			header: {
				alignment: "center",
				content: `Events ${path.basename(directory)}`,
			},
			singleLine: true,
			columns: [{ width: 25 }, { width: 5, alignment: "center" }],
		}),
	);
};

function createfile(dir) {
	const fs = require("fs");

	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}
}

module.exports = {
	loadFiles,
	loadEvents,
	createfile,
};
