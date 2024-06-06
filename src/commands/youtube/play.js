const Command = require("../../structures/Command");
const { MessageEmbed } = require("discord.js");
const ytdl = require("ytdl-core");
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');

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
    // Delete the user's message
    message.delete().catch(err => console.error('Failed to delete the message:', err));

    if (!message.member.voice.channel) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription("You need to join a voice channel first!"),
        ],
      });
    }

    if (!args[0]) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription("Please provide a valid YouTube URL."),
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

        message.channel.send({ embeds: [embed] });
      });

      player.on(AudioPlayerStatus.Idle, () => {
        player.stop();
        message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor("GREEN")
              .setDescription("Finished playing."),
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
              .setDescription("An error occurred while playing the audio."),
          ],
        });
      });

      connection.subscribe(player);
      player.play(resource);
    } catch (error) {
      console.error(error);
      message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription("Failed to play the song. Please ensure the URL is correct."),
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
