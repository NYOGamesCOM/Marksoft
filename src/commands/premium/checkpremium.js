const Command = require("../../structures/Command");
const { MessageEmbed } = require("discord.js");
const Guild = require('../../database/schemas/Guild');

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "checkpremium",
      description: "Checks if the guild is premium and shows the remaining time and expiry date.",
      category: "Premium",
      guildOnly: true,
      userPermission: ["MANAGE_GUILD"],
    });
  }

  async run(message) {
    try {
      let guildId = message.guild.id;
      const guildConfig = await Guild.findOne({ guildId: message.guild.id });

      if (!guildConfig || guildConfig.isPremium !== 'true') {
        const embed = new MessageEmbed()
          .setColor("#FF0000")
          .setTitle("Premium Subscription Info")
          .setDescription(`**${message.guild.name}** does not have a premium subscription.`);
          embed.setFooter({
            text: `Requested by ${message.author.username}`,
            iconURL: message.author.displayAvatarURL({ dynamic: true }),
          });
          embed.setTimestamp();
        return message.channel.sendCustom({ embeds: [embed] });    
      }

      const expiresAt = new Date(Number(guildConfig.premium.expiresAt));
      const now = new Date();
      const timeRemaining = expiresAt - now;

      if (timeRemaining <= 0) {
        const embed = new MessageEmbed()
          .setColor("#FF0000")
          .setTitle("Premium Subscription Info")
          .setDescription(`**${message.guild.name}** premium subscription has expired.`);
          embed.setFooter({
            text: `Requested by ${message.author.username}`,
            iconURL: message.author.displayAvatarURL({ dynamic: true }),
          });
          embed.setTimestamp();
        return message.channel.sendCustom({ embeds: [embed] });    
      }

      const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
      const hoursRemaining = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

      const embed = new MessageEmbed()
        .setColor("#00FF00")
        .setTitle(`Premium Subscription Info`)
        .setDescription(`**• ${message.guild.name}** has a premium subscription\n
        **• Expires in:** \`${daysRemaining} days, ${hoursRemaining} hours, and ${minutesRemaining} minutes.\`
        **• Expiry Date:** \`${expiresAt.toDateString()}\`
        **• Subscription Plan:** \`${guildConfig.premium.plan}\`
        **• Receipt:** \`${guildConfig._id}\`
        **• Server ID:** \`${guildId}\`
        \n`);
        embed.setFooter({
          text: `Requested by ${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        });
        embed.setTimestamp();
      return message.channel.sendCustom({ embeds: [embed] });    
    } catch (error) {
      console.error(error);
      const embed = new MessageEmbed()
        .setColor("#FF0000")
        .setTitle("Error")
        .setDescription("An error occurred while checking the premium status. Please try again later.")
        .setTimestamp();
      return message.channel.sendCustom({ embeds: [embed] });    
    }
  }
};
