const Command = require("../../structures/Command");
const Guild = require("../../database/schemas/Guild");
const { MessageEmbed } = require("discord.js");
const { incrementCommandCounter } = require("../../utils/utils.js");
module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "anti-invites",
      aliases: ["anti-invite", "antiinvite", "antiinvites"],
      description: "Block Invites from the current server!",
      category: "config",
      usage: ["<enable | disable>"],
      examples: ["anti-invites enable", "anti-invites disable"],
      cooldown: 3,
      userPermission: ["MANAGE_GUILD"],
    });
  }

  async run(message, args) {
    const guildDB = await Guild.findOne({
      guildId: message.guild.id,
    });

    const language = require(`../../data/language/${guildDB.language}.json`);

    if (args.length < 1) {
      return message.channel.sendCustom({
        embeds: [
          new MessageEmbed()
            .setColor(message.guild.me.displayHexColor)
            .setDescription(
              `:x: ${language.antiinvites1}`
            ),
        ],
      });
    }

    if (
      !message.content.includes("enable") &&
      !message.content.includes("disable")
    ) {
      return message.channel.sendCustom({
        embeds: [
          new MessageEmbed()
            .setColor(message.guild.me.displayHexColor)
            .setDescription(
              `:x: ${language.antiinvites1}`
            ),
        ],
      });
    }

    if (args.includes("disable")) {
      if (guildDB.antiInvites === true)
        return message.channel.sendCustom({
          embeds: [
            new MessageEmbed()
              .setColor(message.guild.me.displayHexColor)
              .setDescription(
                `:x: ${language.moduleDisabled}`
              ),
          ],
        });

      await Guild.findOne(
        {
          guildId: message.guild.id,
        },
        async (err, guild) => {
          guild
            .updateOne({
              antiInvites: false,
            })
            .catch((err) => console.error(err));

          return message.channel.sendCustom({
            embeds: [
              new MessageEmbed()
                .setColor(message.guild.me.displayHexColor)
                .setDescription(
                  `:white_check_mark: ${language.antiinvites3}`
                ),
            ],
          });
        }
      );
      return;
    }

    if (args.includes("enable")) {
      if (guildDB.antiInvites === true)
        return message.channel.sendCustom({
          embeds: [
            new MessageEmbed()
              .setColor(message.guild.me.displayHexColor)
              .setDescription(
                `:x: ${language.moduleEnabled}`
              ),
          ],
        });

      await Guild.findOne(
        {
          guildId: message.guild.id,
        },
        async (err, guild) => {
          guild
            .updateOne({
              antiInvites: true,
            })
            .catch((err) => console.error(err));

          return message.channel.sendCustom({
            embeds: [
              new MessageEmbed()
                .setColor(message.guild.me.displayHexColor)
                .setDescription(
                  `:white_check_mark: ${language.antiinvites4}`
                ),
            ],
          });
        }
      );
      return;
    }
  }
};
