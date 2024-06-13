const Command = require("../../structures/Command");
const { MessageEmbed } = require("discord.js");
const Guild = require('../../database/schemas/Guild');

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "removepremium",
      description: "Remove premium status from the guild.",
      category: "premium",
      ownerOnly: true, // Adjust permissions as needed
      guildOnly: true,
    });
  }

  async run(message) {
    try {
      // Find the guild's premium status record
      const guildConfig = await Guild.findOne({ guildId: message.guild.id });

      // If no record exists or the guild is not premium, inform the user
      if (!guildConfig || guildConfig.isPremium !== 'true') {
        const embed = new MessageEmbed()
          .setColor("#FF0000")
          .setTitle("Remove Premium Status")
          .setDescription("This guild does not have a premium subscription.")
          .setTimestamp();
        return message.channel.sendCustom({ embeds: [embed] });
      }

      // Update the premium status record
      guildConfig.isPremium = 'false';
      guildConfig.premium = {
        redeemedBy: { id: null, tag: null },
        redeemedAt: null,
        expiresAt: null,
        plan: null
      };

      // Save the updated record
      await guildConfig.save();

      // Inform the user that premium status has been removed
      const embed = new MessageEmbed()
        .setColor("#00FF00")
        .setTitle("Remove Premium Status")
        .setDescription("Premium status has been removed from the guild.")
        .setTimestamp();
      return message.channel.sendCustom({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      // Inform the user about the error
      const embed = new MessageEmbed()
        .setColor("#FF0000")
        .setTitle("Error")
        .setDescription("An error occurred while removing premium status from the guild. Please try again later.")
        .setTimestamp();
      return message.channel.sendCustom({ embeds: [embed] });
    }
  }
};
