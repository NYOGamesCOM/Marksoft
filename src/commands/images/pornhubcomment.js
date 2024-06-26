const Command = require("../../structures/Command");
const Guild = require("../../database/schemas/Guild");
const discord = require("discord.js");
const { Canvas } = require("canvacord");
const { incrementCommandCounter } = require("../../utils/utils.js");
module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "pornhubcomment",
      aliases: ["phcomment", "phubcomment"],
      description: "Make your own HUB text!",
      category: "images",
      usage: "<text>",
      examples: ["pornhubcomment Hello there"],
      cooldown: 5,
    });
  }

  async run(message, args) {
    const client = message.client;
    const guildDB = await Guild.findOne({
      guildId: message.guild.id,
    });

    const language = require(`../../data/language/${guildDB.language}.json`);

    let text = args.slice(0).join(" ");
    if (!text)
      return message.channel.sendCustom({
        embeds: [
          new discord.MessageEmbed()
            .setColor(client.color.red)
            .setDescription(
              `${client.emoji.fail} ${language.changeErrorValid}`
            ),
        ],
      });

    if (text.length > 50)
      return message.channel.sendCustom({
        embeds: [
          new discord.MessageEmbed()
            .setColor(client.color.red)
            .setDescription(
              `${client.emoji.fail} ${language.phubErrorCharacter}`
            ),
        ],
      });

    Canvas.phub({
      username: message.author.username,
      message: text,
      image: message.author.displayAvatarURL({ format: "png" }),
    }).then((attachment) =>
      message.channel.sendCustom({ files: [{ attachment, name: "img.png" }] })
    );
  }
};
