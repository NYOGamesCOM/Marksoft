/* MADE FOR BANKAI COMMUNITY */

const discord = require("discord.js");
const Command = require("../../structures/Command");
const Guild = require("../../database/schemas/Guild");
const { incrementCommandCounter } = require("../../utils/utils.js");
module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "f",
      description: "Pay your respect!",
      category: "fun",
      cooldown: 3,
    });
  }

  async run(message, args) {
    const guildDB = await Guild.findOne({
      guildId: message.guild.id,
    });

    const language = require(`../../data/language/${guildDB.language}.json`);

    const target = message.mentions.users.first();

    if (!args[0]) {
      message.delete().catch(() => {});
      const embed = new discord.MessageEmbed()
        .setAuthor(
          `${message.author.username} has paid their respects.`,
          message.author.displayAvatarURL({ format: "png" })
        )
        .setColor("PURPLE")
        .setFooter({ text: `${language.f3}` });
      message.channel
        .sendCustom({ embed })
        .then((m) => m.react("🇫"))
        .catch(() => {});
    } else {
      message.delete().catch(() => {});
      const embed = new discord.MessageEmbed()
        .setAuthor("\u2000", message.author.displayAvatarURL({ format: "png" }))
        .setColor("PURPLE")
        .setDescription(`${message.author} ${language.f2} ${target}`)
        .setFooter({ text: `${language.f3}` });
      message.channel
        .sendCustom({ embed })
        .then((m) => m.react("🇫"))
        .catch(() => {});
    }
  }
};