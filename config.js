module.exports = {
  // Cho phép deploy command bot
  // Allow bot command deployment
  deploy: true,

  // Tên hoạt động của bot
  // Bot's activity name
  ActivityName: '/help',

  // Trạng thái mặc định của bot 'online', 'idle', 'dnd', 'invisible'
  // Default bot status: 'online', 'idle', 'dnd', 'invisible'
  Status: 'online',

  // Thời gian chờ mặc định giữa các lệnh (tính bằng giây)
  // Default cooldown duration between commands (in seconds)
  defaultCooldownDuration: 5,

  // Bật tính năng tìm kiếm hình ảnh 'true', 'false' nên tắt khi chạy trên server vì khá tốn tài nguyên
  // Enable image search feature 'true', 'false'. Should be turned off when running on server as it's resource-intensive
  ImageSearch: true,

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

  // Bật tính năng voice assistance
  // Enable voice assistance feature
  voiceAssistance: true,
};
