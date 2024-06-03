const Command = require("../../structures/Command");
const { MessageEmbed } = require("discord.js");
const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "join",
      aliases: ["enter"],
      description: "Joins the voice channel",
      category: "Music",
      usage: "",
      cooldown: 5,
    });
  }

  async run(message, args) {
    if (!message.member.voice.channel) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription("You need to join a voice channel first!"),
        ],
      });
    }

    const connection = joinVoiceChannel({
      channelId: message.member.voice.channel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });

    message.channel.send({
      embeds: [
        new MessageEmbed()
          .setColor("GREEN")
          .setDescription("Joined the voice channel!"),
      ],
    });
  }
};
