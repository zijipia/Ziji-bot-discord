module.exports.data = {
	name: "getVariable",
	type: "other",
};

/**
 * Hàm để thay thế các biến trong chuỗi bằng giá trị thực tế.
 * @param {string} template - Chuỗi chứa các biến cần thay thế.
 * @param {object} message - Đối tượng message từ Discord.js.
 * @returns {string} - Chuỗi đã được xử lý với các biến thay thế.
 */
module.exports.execute = (template, message) => {
      if (!message || !message.guild || !message.author) return template;
    
      // Lấy thông tin về người dùng và máy chủ
      const user = message.author;
      const server = message.guild;
    
      // Tính số lượng thành viên (trừ bot nếu cần)
      const memberCountNoBots = server.members.cache.filter((member) => !member.user.bot).size;
    
      // Thay thế các biến
      return template
        .replace(/{user}/g, `<@${user.id}>`) // Mention người dùng
        .replace(/{user_tag}/g, `${user.tag}`) // Tag của người dùng (username#discriminator)
        .replace(/{user_name}/g, `${user.username}`) // Tên người dùng
        .replace(/{server_name}/g, `${server.name}`) // Tên máy chủ
        .replace(/{server_membercount}/g, `${server.memberCount}`) // Số lượng thành viên
        .replace(/{server_membercount_nobots}/g, `${memberCountNoBots}`); // Số lượng thành viên (trừ bot)
}