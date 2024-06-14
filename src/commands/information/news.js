const Command = require("../../structures/Command");
const Guild = require("../../database/schemas/Marksoft");
const Guildd = require("../../database/schemas/Guild");
const { MessageEmbed } = require("discord.js");
const moment = require("moment");
moment.suppressDeprecationWarnings = true;

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "news",
      description: `Shows Marksoft's latest news`,
      category: "Information",
      cooldown: 3,
    });
  }

  async run(message) {
    const guildDB = await Guild.findOne({});

    const guildDB2 = await Guildd.findOne({
      guildId: message.guild.id,
    });

    const language = require(`../../data/language/${guildDB2.language}.json`);

    if (!guildDB) return message.channel.sendCustom(`${language.noNews}`);

    let embed = new MessageEmbed()
      .setColor(message.guild.me.displayHexColor)
      .setTitle(`Marksoft News`)
      .setDescription(
        `***__${language.datePublished}__ ${moment(guildDB.time).format(
          "dddd, MMMM Do YYYY"
        )}*** *__[\`(${moment(
          guildDB.time
        ).fromNow()})\`](https://Marksoft.ro)__*\n\n ${guildDB.news}`
      )
      .setFooter(`Requested by ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    message.channel.sendCustom({ embeds: [embed] }).catch(() => {
      message.channel.sendCustom(`${language.noNews}`);
    });
  }
};
