module.exports = {
  // Cho phép deploy command bot
  deploy: true,
  // Tên hoạt động của bot
  ActivityName: '/help',
  // Trạng thái mặc định của bot 'online', 'idle', 'dnd', 'invisible'
  Status: 'online',
  // Thời gian chờ mặc định giữa các lệnh (tính bằng giây)
  defaultCooldownDuration: 5,
  // Bật tính năng tìm kiếm hình ảnh 'true', 'false' nên tắt khi chạy trên server vì khá tốn tài nguyên
  ImageSearch: true,
  // Ngôn ngữ mặc định của bot (vi, en, ...)
  DeafultLang: 'vi',
  // Danh sách ID của chủ sở hữu bot (người dùng có thể thực hiện lệnh owner) ["ID admin", "ID admin", ...]
  OwnerID: [],
  // Danh sách ID của các server dành cho nhà phát triển ["ID server", "ID server", ...] or []
  DevGuild: [],
};
