const discord = require("discord.js");
const Command = require("../../structures/Command");
const Guild = require("../../database/schemas/Guild");
const alt = require("../../database/models/altdetector.js");
const { incrementCommandCounter } = require("../../utils/utils.js");
module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "asetdays",
      aliases: ["asd"],
      category: "Alt Detector",
      usage: "<days>",
      description: "Set the amount of days of the alt age.",
      examples: ["asetdays 7"],
      cooldown: 5,
      userPermission: ["MANAGE_GUILD"],
    });
  }
  async run(message, args) {
    const guildDB = await Guild.findOne({
      guildId: message.guild.id,
    });
    const language = require(`../../data/language/${guildDB.language}.json`);

    const client = message.client;

    let days = args[0];
    if (!days)
      return message.channel.sendCustom({
        embeds: [
          new discord.MessageEmbed()
            .setColor(client.color.red)
            .setDescription(language.setdaysInvalidArg),
        ],
      });
    if (isNaN(days))
      return message.channel.sendCustom({
        embeds: [
          new discord.MessageEmbed()
            .setColor(client.color.red)
            .setDescription(language.setdaysInvalidArg),
        ],
      });

    let day = Number(days);

    if (day > 100)
      return message.channel.sendCustom({
        embeds: [
          new discord.MessageEmbed()
            .setColor(client.color.red)
            .setDescription(
              `:x: Please do not exceed the length of 100 days.`
            ),
        ],
      });

    await alt.findOne(
      {
        guildID: message.guild.id,
      },
      async (err, db) => {
        if (!db) {
          let newGuild = new alt({
            guildID: message.guild.id,
            altDays: days,
            altModlog: "",
            allowedAlts: [],
            altAction: "none",
            altToggle: false,
            notifier: false,
          });

          await newGuild.save().catch((err) => {
            console.log(err);
          });

          return message.channel.sendCustom({
            embeds: [
              new discord.MessageEmbed()
                .setColor(client.color.green)
                .setDescription(language.setdaysSuccess),
            ],
          });
        }

        await db.updateOne({
          altDays: day,
        });

        message.channel.sendCustom({
          embeds: [
            new discord.MessageEmbed()
              .setColor(client.color.green)
              .setDescription(language.setdaysSuccess),
          ],
        });
      }
    );
  }
};
