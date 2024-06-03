const Command = require("../../structures/Command");
const { MessageEmbed } = require("discord.js");
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "leave",
      aliases: ["exit", "quit"],
      description: "Leaves the voice channel",
      category: "Music",
      usage: "",
      cooldown: 5,
    });
  }

  async run(message, args) {
    const connection = getVoiceConnection(message.guild.id);
    if (connection) {
      connection.destroy();
      message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor("GREEN")
            .setDescription("Left the voice channel."),
        ],
      });
    } else {
      message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription("I am not in a voice channel."),
        ],
      });
    }
  }
};
