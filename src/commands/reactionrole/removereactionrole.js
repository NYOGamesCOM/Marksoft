const Command = require("../../structures/Command");
const { MessageEmbed } = require("discord.js");
const ReactionRole = require("../../packages/reactionrole/index.js");
const react = new ReactionRole();
const { incrementCommandCounter } = require("../../utils/utils.js");
require("dotenv").config();
react.setURL(process.env.MONGO);

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "removerr",
      aliases: [
        "removereactionrole",
        "rreactionrole",
        "deletereactionrole",
        "delreactionrole",
        "remrr",
        "delrr",
        "delreaction",
        "deletereaction",
      ],
      description: "Remove a reaction role",
      category: "Reaction Role",
      cooldown: 3,
      usage: "<channel> <messageID> <emoji>",
      userPermission: ["MANAGE_GUILD"],
    });
  }

  async run(message, args) {
    let client = message.client;
    let fail = message.client.emoji.fail;
    let success = message.client.emoji.success;

    let channel =
      message.mentions.channels.first() ||
      message.guild.channels.cache.get(args[0]) ||
      message.guild.channels.cache.find((ch) => ch.name === args[0]);
    if (!channel)
      return message.channel.sendCustom({
        embeds: [
          new MessageEmbed()
            .setAuthor(message.author.tag, message.author.displayAvatarURL())
            .setDescription(`${fail} Provide me with a valid Channel`)
            .setFooter(`Requested by ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
            .setColor(client.color.red),
        ],
      });

    let ID = args[1];
    if (!ID)
      return message.channel.sendCustom({
        embeds: [
          new MessageEmbed()
            .setAuthor(message.author.tag, message.author.displayAvatarURL())
            .setDescription(`${fail} Provide me with a valid message ID`)
            .setFooter(`Requested by ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true })),
        ],
      });
    let messageID = await channel.messages.fetch(ID).catch(() => {
      return message.channel.sendCustom({
        embeds: [
          new MessageEmbed()
            .setAuthor(message.author.tag, message.author.displayAvatarURL())
            .setDescription(`${fail} I could not find the following ID`)
            .setFooter(`Requested by ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
            .setColor(client.color.red),
        ],
      });
    });

    let emoji = args[2];

    if (!emoji)
      return message.channel.sendCustom({
        embeds: [
          new MessageEmbed()
            .setAuthor(message.author.tag, message.author.displayAvatarURL())
            .setDescription(`${fail} Provide me with a valid Emoji`)
            .setFooter(`Requested by ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
            .setColor(client.color.red),
        ],
      });

    await react.reactionDelete(client, message.guild.id, ID, emoji);

    message.channel.sendCustom({
      embeds: [
        new MessageEmbed()
          .setColor(client.color.green)
          .setAuthor(message.author.tag, message.author.displayAvatarURL())
          .setDescription(
            `${success} Deleted The [Reaction Role](${messageID.url})`
          )
          .setFooter(`Requested by ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true })),
      ],
    });
  }
};
