const Command = require("../../structures/Command");
const Guild = require("../../database/schemas/Guild");
const { MessageEmbed } = require("discord.js");
module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "invite",
      aliases: ["inv"],
      description: "Sends you Marksoft invite link",
      category: "Utility",
      cooldown: 3,
    });
  }

  async run(message) {
    const guildDB = await Guild.findOne({
      guildId: message.guild.id,
    });

    const language = require(`../../data/language/${guildDB.language}.json`);

    const embed = new MessageEmbed()
      .setColor(message.guild.me.displayHexColor)
      .setDescription(
        `${language.invite}(https://discord.com/api/oauth2/authorize?client_id=1003423081123033108&permissions=8&scope=bot%20applications.commands) ${message.client.emoji.success}`
      );

    await message.channel.sendCustom({ embeds: [embed] });
  }
};
