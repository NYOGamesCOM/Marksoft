const Command = require("../../structures/Command");
const Guild = require("../../database/schemas/Guild");
const { MessageEmbed } = require("discord.js");
const { incrementCommandCounter } = require("../../utils/utils.js");
module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "uptime",
      aliases: ["ut", "uptime"],
      cooldown: 2,
      description: "Sends you Marksoft's Uptime!",
      category: "Information",
    });
  }

  async run(message) {
    const guildDB = await Guild.findOne({
      guildId: message.guild.id,
    });
    const language = require(`../../data/language/${guildDB.language}.json`);
    let uptime = this.client.uptime;
    if (uptime instanceof Array) {
      uptime = uptime.reduce((max, cur) => Math.max(max, cur), -Infinity);
    }
    let seconds = uptime / 1000;
    let days = parseInt(seconds / 86400);
    seconds = seconds % 86400;
    let hours = parseInt(seconds / 3600);
    seconds = seconds % 3600;
    let minutes = parseInt(seconds / 60);
    seconds = parseInt(seconds % 60);
    uptime = `${seconds}s`;
    if (days) {
      uptime = `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
    } else if (hours) {
      uptime = `${hours} hours, ${minutes} minutes and ${seconds} seconds`;
    } else if (minutes) {
      uptime = `${minutes} minutes and ${seconds} seconds`;
    } else if (seconds) {
      uptime = `${seconds} seconds`;
    }
    // const date = moment().subtract(days, 'ms').format('dddd, MMMM Do YYYY');
    const embed = new MessageEmbed()
      .setDescription(`${language.uptime1} \`${uptime}\`.`)
      .setFooter(`Requested by ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
      .setColor(message.guild.me.displayHexColor);
    message.channel.sendCustom({ embeds: [embed] });
  }
};
