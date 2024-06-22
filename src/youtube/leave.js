const Command = require("../../structures/Command");
const { MessageEmbed } = require("discord.js");
const { getVoiceConnection, AudioPlayerStatus } = require('@discordjs/voice');

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "leave",
      aliases: ["exit", "quit"],
      description: "Leaves the voice channel",
      category: "Youtube",
      usage: "",
      cooldown: 5,
    });
  }

  async run(message, args) {
    try {
      const connection = getVoiceConnection(message.guild.id);

      if (connection) {
        // Attach error event listener to handle socket errors gracefully
        connection.on('stateChange', (oldState, newState) => {
          if (newState.status === AudioPlayerStatus.Idle) {
            // Handle socket errors gracefully
            connection.destroy();
          }
        });

        connection.on('error', (err) => {
          console.error('Socket error:', err);
          connection.destroy();
        });

        // Gracefully leave the voice channel
        await connection.destroy();

        // Send confirmation message
        message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor("RED")
              .setDescription("Left the voice channel.")
              .setFooter({
                text: `Requested by ${message.author.username}`,
                iconURL: message.author.displayAvatarURL({ dynamic: true }),
              })
              .setTimestamp(),
          ],
        });
      } else {
        // Handle case when bot is not in any voice channel
        message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor("RED")
              .setDescription("I am not in a voice channel.")
              .setFooter({
                text: `Requested by ${message.author.username}`,
                iconURL: message.author.displayAvatarURL({ dynamic: true }),
              })
              .setTimestamp(),
          ],
        });
      }
    } catch (error) {
      // Handle any errors during execution
      console.error("Error leaving voice channel:", error);
      message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription("An error occurred while trying to leave the voice channel.")
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
