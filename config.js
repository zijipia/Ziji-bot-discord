module.exports = {
  // Cho phép deploy command bot
  // Allow bot command deployment
  deploy: true,

  // Thời gian chờ mặc định giữa các lệnh (tính bằng mili giây)
  // Default cooldown duration between commands (in milliseconds)
  defaultCooldownDuration: 5000,

  // Bật tính năng voice assistance
  // Enable voice assistance feature
  voiceAssistance: true,

  // Bật tính năng tìm kiếm hình ảnh 'true', 'false' nên tắt khi chạy trên server vì khá tốn tài nguyên
  // Enable image search feature 'true', 'false'. Should be turned off when running on server as it's resource-intensive
  ImageSearch: true,

  // Cấu hình mặc định của bot
  // Default bot configuration
  botConfig: {
    // Tên hoạt động của bot
    // Bot's activity name
    ActivityName: '/help',

    // Loại hoạt động của bot
    // Bot's activity type (PLAYING, WATCHING, LISTENING, STREAMING)
    ActivityType: 'PLAYING',

    // Trạng thái mặc định của bot 'online', 'idle', 'dnd', 'invisible'
    // Default bot status: 'online', 'idle', 'dnd', 'invisible'
    Status: 'online',

    // ID của channel bot gửi lỗi
    // Bot's error log channel ID
    ErrorLog: '',

    // ID của server hỗ trợ
    // Support server ID
    SupportServer: 'https://discord.gg/bkBejRNcR3',

    // Link mời bot
    // Bot's invite link
    InviteBot: '',

    // Link ảnh banner
    // Banner image link
    Banner: 'https://media.discordapp.net/attachments/1064851388221358153/1209448467077005332/image.png',
  },

  // Cấu hình mặc định của player
  // Default player configuration
  PlayerConfig: {
    // Mặc định tắt nghe của bot
    // Default: bot doesn't listen (deaf mode)
    selfDeaf: true,

    // Mặc định volume của bot (0-100) (auto)
    // Default bot volume (0-100) (auto)
    volume: 'auto',

    // Mặc định bot sẽ rời khi không còn ai nghe
    // Default: bot leaves when no one is listening
    leaveOnEmpty: true,

    // Thời gian chờ bot sẽ rời khi không có người trong voice (ms)
    // Cooldown before bot leaves when no one is listening (ms)
    leaveOnEmptyCooldown: 5000,

    // Mặc định bot sẽ rời khi hết bài hát
    // Default: bot leaves when the song ends
    leaveOnEnd: true,

    // Thời gian chờ bot sẽ rời khi hết bài hát (ms)
    // Cooldown before bot leaves after song ends (ms)
    leaveOnEndCooldown: 500000,
  },

  // Ngôn ngữ mặc định của bot (vi, en, ...)
  // Default bot language (vi, en, ...)
  DeafultLang: 'vi',

  // Danh sách ID của chủ sở hữu bot (người dùng có thể thực hiện lệnh owner) ["ID admin", "ID admin", ...]
  // List of bot owner IDs (users who can execute owner commands) ["admin ID", "admin ID", ...]
  OwnerID: [],

  // Danh sách ID của các server dành cho nhà phát triển ["ID server", "ID server", ...] or []
  // List of server IDs for developers ["server ID", "server ID", ...] or []
  DevGuild: [],

  // Danh sách các lệnh cần tắt ["Play / Add music", "giveaways", ...]
  // List of commands to disable ["command name", "command name", ...]
  disabledCommands: [],
};
