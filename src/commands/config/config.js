const Command = require("../../structures/Command");
const Guild = require("../../database/schemas/Guild");
const { MessageEmbed } = require("discord.js");
const { incrementCommandCounter } = require("../../utils/utils.js");
module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "settings",
      aliases: ["cfg"],
      description: "Show's the current settings for this guild",
      category: "config",
      guildOnly: true,
      userPermission: ["MANAGE_GUILD"],
    });
  }

  async run(message) {
    const guildDB = await Guild.findOne({
      guildId: message.guild.id,
    });

    const language = require(`../../data/language/${guildDB.language}.json`);
    await message.channel.sendCustom({
      embeds: [
        new MessageEmbed()
          .setColor(message.guild.me.displayHexColor)
          .setTitle(`${language.serversettings1}`)
          .addField(
            `Main Settings`,
            `[\`Click here\`](http://localhost:3000/dashboard/${message.guild.id})`,
            true
          )
          .addField(
            `Welcome & Leave`,
            `[\`Click here\`](http://localhost:3000/dashboard/${message.guild.id}/welcome)`,
            true
          )
          .addField(
            `Logging`,
            `[\`Click here\`](http://localhost:3000/dashboard/${message.guild.id}/logging)`,
            true
          )
          .addField(
            `Autorole`,
            `[\`Click here\`](http://localhost:3000/dashboard/${message.guild.id}/autorole)`,
            true
          )
          .addField(
            `Alt Detector`,
            `[\`Click here\`](http://localhost:3000/dashboard/${message.guild.id}/altdetector)`,
            true
          )
          .addField(
            `Tickets`,
            `[\`Click here\`](http://localhost:3000/dashboard/${message.guild.id}/tickets)`,
            true
          )
          .addField(
            `Suggestions`,
            `[\`Click here\`](http://localhost:3000/dashboard/${message.guild.id}/Suggestions)`,
            true
          )
          .addField(
            `Server Reports`,
            `[\`Click here\`](http://localhost:3000/dashboard/${message.guild.id}/reports)`,
            true
          )
          .addField(
            `Automod`,
            `[\`Click here\`](http://localhost:3000/dashboard/${message.guild.id}/automod)`,
            true
          )

          .setFooter({ text: `${message.guild.name}` }),
      ],
    });
  }
};
