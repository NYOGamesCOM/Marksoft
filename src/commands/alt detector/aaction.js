const discord = require("discord.js");
const Command = require("../../structures/Command");
const Guild = require("../../database/schemas/Guild");
const alt = require("../../database/models/altdetector.js");
const { incrementCommandCounter } = require("../../utils/utils.js");
module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "aaction",
      aliases: [],
      usage: "<ban | kick | none>",
      category: "Alt Detector",
      examples: ["aaction kick"],
      description: "Pick the action fired towards the alt.",
      cooldown: 5,
      userPermission: ["MANAGE_GUILD"],
    });
  }
  async run(message, args) {
    const guildDB = await Guild.findOne({
      guildId: message.guild.id,
    });
    const language = require(`../../data/language/${guildDB.language}.json`);

    let choices = ["none", "kick", "ban"];
    if (!args[0])
      return message.channel.sendCustom({
        embeds: [
          new discord.MessageEmbed()
            .setAuthor(
              `${message.author.tag}`,
              message.author.displayAvatarURL({ format: "png" })
            )
            .setDescription(
              `${message.client.emoji.fail
              } ${language.aactionNotValidChoice.replace(
                "{allChoices}",
                choices.join(", ")
              )}`
            )
            .setFooter(`Requested by ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setColor("RED"),
        ],
      });

    if (!choices.includes(args[0].toLowerCase()))
      return message.channel.sendCustom({
        embeds: [
          new discord.MessageEmbed()
            .setAuthor(
              `${message.author.tag}`,
              message.author.displayAvatarURL({ format: "png" })
            )
            .setDescription(
              `${message.client.emoji.fail
              } ${language.aactionNotValidChoice.replace(
                "{allChoices}",
                choices.join(", ")
              )}`
            )
            .setFooter(`Requested by ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setColor("RED"),
        ],
      });

    await alt.findOne({ guildID: message.guild.id }, async (err, db) => {
      if (!db) {
        let newGuild = new alt({
          guildID: message.guild.id,
          altDays: 7,
          altModlog: "",
          allowedAlts: [],
          altAction: args[0].toLowerCase(),
          altToggle: false,
          notifier: false,
        });

        await newGuild.save().catch((err) => {
          console.log(err);
        });
        return message.channel.sendCustom({
          embeds: [
            new discord.MessageEmbed()
              .setAuthor(
                `${message.author.tag}`,
                message.author.displayAvatarURL({ format: "png" })
              )
              .setDescription(
                `:white_check_mark: ${language.aactionSuccess.replace("{action}", args[0])}`
              )
              .setFooter(`Requested by ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
              .setTimestamp()
              .setColor("RED"),
          ],
        });
      }
      await db.updateOne({
        altAction: args[0].toLowerCase(),
      });

      return message.channel.sendCustom({
        embeds: [
          new discord.MessageEmbed()
            .setAuthor(
              `${message.author.tag}`,
              message.author.displayAvatarURL({ format: "png" })
            )
            .setDescription(
              `:white_check_mark: ${language.aactionSuccess.replace("{action}", args[0])}`
            )
            .setFooter(`Requested by ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setColor("RED"),
        ],
      });
    });
  }
};
