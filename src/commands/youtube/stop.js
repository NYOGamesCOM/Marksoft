const Command = require("../../structures/Command");
const { MessageEmbed } = require("discord.js");
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "stop",
      aliases: ["halt"],
      description: "Stops the currently playing music",
      category: "Music",
      usage: "",
      cooldown: 5,
    });
  }

  async run(message, args) {
    const connection = getVoiceConnection(message.guild.id);
    if (connection) {
      const player = connection.state.subscription.player;
      player.stop();
      message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription("Stopped playing"),
        ],
      });
    } else {
      message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription("I am not playing anything."),
        ],
      });
    }
  }
};
