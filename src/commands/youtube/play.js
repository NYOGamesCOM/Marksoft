const Command = require("../../structures/Command");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const ytdl = require("ytdl-core");
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, getVoiceConnection } = require('@discordjs/voice');

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "play",
      aliases: ["p"],
      description: "Plays a song from YouTube",
      category: "Music",
      usage: "<YouTube URL>",
      cooldown: 5,
    });
  }

  async run(message, args) {

    if (!message.member.voice.channel) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription("You need to join a voice channel first!")
            .setFooter({
              text: `Requested by ${message.author.username}`,
              iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setTimestamp(),
        ],
      });
    }

    if (!args[0]) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription("Please provide a valid YouTube URL.")
            .setFooter({
              text: `Requested by ${message.author.username}`,
              iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setTimestamp(),
        ],
      });
    }

    const connection = joinVoiceChannel({
      channelId: message.member.voice.channel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });

    try {
      const songInfo = await ytdl.getInfo(args[0]);
      const stream = ytdl(args[0], { filter: 'audioonly' });
      const resource = createAudioResource(stream);
      const player = createAudioPlayer();

      let volume = 1.0; // Default volume

      player.on(AudioPlayerStatus.Playing, () => {
        const embed = new MessageEmbed()
          .setColor("GREEN")
          .setTitle("Marksoft Player")
          .setDescription(`[${songInfo.videoDetails.title}](${args[0]})`)
          .addField("Channel", songInfo.videoDetails.author.name, true)
          .addField("Duration", formatDuration(songInfo.videoDetails.lengthSeconds), true)
          .setThumbnail(songInfo.videoDetails.thumbnails[0].url)
          .setFooter({
            text: `Requested by ${message.author.username}`,
            iconURL: message.author.displayAvatarURL({ dynamic: true }),
          })
          .setTimestamp();

        const row = new MessageActionRow()
          .addComponents(
            new MessageButton()
              .setCustomId('volume_down')
              .setLabel('-')
              .setStyle('DANGER'),
            new MessageButton()
              .setCustomId('volume_up')
              .setLabel('+')
              .setStyle('SUCCESS')
          );

        message.channel.send({ embeds: [embed], components: [row] });
      });

      player.on(AudioPlayerStatus.Idle, () => {
        player.stop();
        connection.destroy();
        message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor("GREEN")
              .setDescription("Finished playing.")
              .setFooter({
                text: `Requested by ${message.author.username}`,
                iconURL: message.author.displayAvatarURL({ dynamic: true }),
              })
              .setTimestamp(),
          ],
        });
      });

      player.on('error', error => {
        console.error(error);
        player.stop();
        connection.destroy();
        message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor("RED")
              .setDescription("An error occurred while playing the audio.")
              .setFooter({
                text: `Requested by ${message.author.username}`,
                iconURL: message.author.displayAvatarURL({ dynamic: true }),
              })
              .setTimestamp(),
          ],
        });
      });

      connection.subscribe(player);
      player.play(resource);

      const filter = i => i.customId === 'volume_up' || i.customId === 'volume_down';
      const collector = message.channel.createMessageComponentCollector({ filter, time: songInfo.videoDetails.lengthSeconds * 1000 });

      collector.on('collect', async i => {
        if (i.customId === 'volume_up') {
          volume = Math.min(volume + 0.1, 2.0); // Increase volume, max 2.0
        } else if (i.customId === 'volume_down') {
          volume = Math.max(volume - 0.1, 0.1); // Decrease volume, min 0.1
        }
        resource.volume.setVolume(volume); // Adjust volume
        await i.update({ content: `Volume: ${(volume * 100).toFixed(0)}%`, components: [] });
      });

      collector.on('end', collected => {
        message.channel.send({ content: 'Volume control ended.', components: [] });
      });

    } catch (error) {
      console.error(error);
      message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription("Failed to play the song. Please ensure the URL is correct.")
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

// Helper function to format duration
function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s]
    .map(v => v < 10 ? "0" + v : v)
    .filter((v, i) => v !== "00" || i > 0)
    .join(":");
}
