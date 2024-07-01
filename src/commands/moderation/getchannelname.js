const Command = require("../../structures/Command");
const { MessageEmbed } = require("discord.js");
const Guild = require("../../database/schemas/Guild"); // Replace with your Guild model
const { incrementCommandCounter } = require("../../utils/utils.js");
module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "getchannelname",
      aliases: ["getcn"],
      description: "Get the name of a text channel by its ID.",
      category: "Utility",
      usage: "<channel ID>",
      guildOnly: true,
    });
  }

  async run(message, args) {
    const channelId = args[0];

    // Find the guild in the database by guild ID
    const guildData = await findGuildByID(message.guild.id);

    if (guildData) {
      // Get the channel by its ID
      const channel = message.guild.channels.cache.get(channelId);

      if (channel && channel.type === 'text') {
        const channelName = channel.name;
        const embed = new MessageEmbed()
          .setColor("#00FF00")
          .setTitle("Channel Name")
          .setDescription(`The name of the channel is: ${channelName}`);
        message.channel.send({ embeds: [embed] });
      } else {
        const embed = new MessageEmbed()
          .setColor("#FF0000")
          .setDescription("Channel not found or is not a text channel.");
        message.channel.send({ embeds: [embed] });
      }
    } else {
      const embed = new MessageEmbed()
        .setColor("#FF0000")
        .setDescription("Guild not found in the database.");
      message.channel.send({ embeds: [embed] });
    }
  }
};

// Replace these functions with your actual database queries
async function findGuildByID(guildId) {
  return Guild.findOne({ guildId: guildId }).exec();
}