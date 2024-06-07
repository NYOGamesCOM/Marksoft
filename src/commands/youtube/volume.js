const Command = require("../../structures/Command");
const { MessageEmbed } = require("discord.js");
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "volume",
      aliases: ["vol"],
      description: "Adjusts the volume of the current song",
      category: "Music",
      usage: "<volume (0-100)>",
      cooldown: 3,
    });
  }

  async run(message, args) {
    message.delete().catch(err => console.error('Failed to delete the message:', err));

    if (!args[0] || isNaN(args[0]) || args[0] < 0 || args[0] > 100) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription("Please provide a valid volume level (0-100).")
            .setFooter({
              text: `Requested by ${message.author.username}`,
              iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setTimestamp(),
        ],
      });
    }

    const volume = parseFloat(args[0]) / 100;
    if (!global.currentSong) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription("No song is currently playing.")
            .setFooter({
              text: `Requested by ${message.author.username}`,
              iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setTimestamp(),
        ],
      });
    }

    const connection = getVoiceConnection(message.guild.id);
    if (!connection) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription("The bot is not connected to a voice channel.")
            .setFooter({
              text: `Requested by ${message.author.username}`,
              iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setTimestamp(),
        ],
      });
    }

    try {
      const player = connection.state.subscription.player;
      const resource = player.state.resource;
      resource.volume.setVolume(volume);
      global.currentSong.volume = volume; // Update global volume

      message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor("GREEN")
            .setDescription(`Volume set to ${(volume * 100).toFixed(0)}%.`)
            .setFooter({
              text: `Requested by ${message.author.username}`,
              iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setTimestamp(),
        ],
      });
    } catch (error) {
      console.error(error);
      message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription("An error occurred while adjusting the volume.")
            .setFooter({
              text: `Requested by ${message.author.username}`,
              iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setTimestamp(),
        ],
      });
    }
  }
};
