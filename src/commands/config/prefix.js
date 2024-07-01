const Command = require("../../structures/Command");
const Guild = require("../../database/schemas/Guild");
const discord = require("discord.js");
const { incrementCommandCounter } = require("../../utils/utils.js");
module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "setprefix",
      description: "Sets the prefix for this server",
      category: "config",
      usage: ["<prefix>"],
      examples: ["setprefix !"],
      cooldown: 3,
      guildOnly: true,
      userPermission: ["MANAGE_GUILD"],
    });
  }

  async run(message, args) {
    const settings = await Guild.findOne(
      {
        guildId: message.guild.id,
      },
      (err) => {
        if (err) console.log(err);
      }
    );

    const guildDB = await Guild.findOne({
      guildId: message.guild.id,
    });

    const language = require(`../../data/language/${guildDB.language}.json`);

    if (!args[0])
      return message.channel.sendCustom({
        embeds: [
          new discord.MessageEmbed()
            .setColor(message.client.color.red)
            .setDescription(
              `:x: ${language.setPrefixMissingArgument}`
            ),
        ],
      });

    if (args[0].length > 5)
      return message.channel.sendCustom({
        embeds: [
          new discord.MessageEmbed()
            .setColor(message.client.color.red)
            .setDescription(
              `:x: ${language.setPrefixLongLength}`
            ),
        ],
      });

    message.channel.sendCustom({
      embeds: [
        new discord.MessageEmbed()
          .setColor(message.client.color.green)
          .setDescription(
            `:white_check_mark: ${language.setPrefixChange.replace(
              "{prefix}",
              args[0]
            )}`
          ),
      ],
    });
    await settings.updateOne({
      prefix: args[0],
    });
  }
};
