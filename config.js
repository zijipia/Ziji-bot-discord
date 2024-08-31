module.exports = {
  // Cho phép deploy command bot
  deploy: true,
  // Tên hoạt động của bot
  ActivityName: 'Ziji bot',
  // Trạng thái mặc định của bot 'online', 'idle', 'dnd', 'invisible'
  Status: 'idle',
  // Thời gian chờ mặc định giữa các lệnh (tính bằng giây)
  defaultCooldownDuration: 5,
  // Bật tính năng tìm kiếm hình ảnh 'true', 'false' nên tắt khi chạy trên server vì khá tốn tài nguyên
  ImageSearch: true,
  // Ngôn ngữ mặc định của bot (vi, en, ...)
  DeafultLang: 'vi',
  // ID của chủ sở hữu bot (người dùng có thể thực hiện lệnh owner) 'ID admin'
  OwnerID: '891275176409460746',
  // Danh sách ID của các server dành cho nhà phát triển ["ID server", "ID server", ...] or []
  DevGuild: [],
};
