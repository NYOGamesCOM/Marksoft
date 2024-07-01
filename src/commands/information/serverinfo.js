const Command = require("../../structures/Command");
const { MessageEmbed } = require("discord.js");
// const Guild = require("../../database/schemas/Guild");
const { incrementCommandCounter } = require("../../utils/utils.js");
function checkDays(date) {
  let now = new Date();
  let diff = now.getTime() - date.getTime();
  let days = Math.floor(diff / 86400000);
  return days + (days === 1 ? " day" : " days") + " ago";
}

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "serverinfo",
      aliases: ["server", "si", "guildinfo", "info"],
      description: "Displays information about the current server.",
      category: "Information",
      guildOnly: true,
      cooldown: 3,
    });
  }

  async run(message) {

    const owner = await message.guild.fetchOwner();
    const guild = message.guild;

    const embed = new MessageEmbed()
      .setTitle(`🌐 **${guild.name}**`)
      .setThumbnail(guild.iconURL({ dynamic: true, size: 512 }))
      .setDescription(`
        **👑 Owner:** \`${owner.user.tag}\`\n
        **🆔 ID:** \`${guild.id}\`\n
        **📅 Created:** \`${guild.createdAt.toUTCString().substr(0, 16)} (${checkDays(guild.createdAt)})\`\n
        **🔢 Members:**
        Total: \`${guild.members.cache.size}\`
        Users: \`${guild.members.cache.filter(member => !member.user.bot).size}\`
        Bots: \`${guild.members.cache.filter(member => member.user.bot).size}\`\n
        **📁 Channels:** \`${guild.channels.cache.size}\`\n
        **🎨 Roles:** \`${guild.roles.cache.size}\`\n
        **🚀 Boost Level:** \`${guild.premiumTier ? `Tier ${guild.premiumTier}` : "None"} (${guild.premiumSubscriptionCount} boosts)\`\n
        **🌍 Region:** \`${guild.region || "Unknown"}\`\n
        **🛡️ Verification Level:** \`${guild.verificationLevel}\`\n
      `)
      .setColor(guild.me.displayHexColor || "#00FFB3")
      .setFooter({ text: `📄 Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};
