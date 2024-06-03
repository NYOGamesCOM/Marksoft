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

    const stream = ytdl(args[0], { filter: 'audioonly' });
    const resource = createAudioResource(stream);
    const player = createAudioPlayer();

    player.on(AudioPlayerStatus.Playing, () => {
      message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor("GREEN")
            .setDescription("Now playing!"),
        ],
      });
    });

    player.on(AudioPlayerStatus.Idle, () => {
      player.stop();
      connection.destroy();
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
  }
};
