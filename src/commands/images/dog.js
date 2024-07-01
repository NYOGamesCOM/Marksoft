const Command = require("../../structures/Command");
const fetch = require("node-fetch");
const Guild = require("../../database/schemas/Guild");
const discord = require("discord.js");
const { incrementCommandCounter } = require("../../utils/utils.js");
module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "dog",
      description: "Get a cute dog picture!",
      category: "images",
      cooldown: 5,
    });
  }

  async run(message) {
    const guildDB = await Guild.findOne({
      guildId: message.guild.id,
    });
    incrementCommandCounter('dog');
    const language = require(`../../data/language/${guildDB.language}.json`);
    try {
      const res = await fetch("https://dog.ceo/api/breeds/image/random");
      const img = (await res.json()).message;
      const embed = new discord.MessageEmbed()
        .setImage(img)
        .setFooter(`Requested by ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
        .setColor(message.guild.me.displayHexColor);
      message.channel.sendCustom({ embeds: [embed] });
    } catch (err) {
      //console.log(`${err}, command name: dog`);
      message.reply(language.birdError);
    }
  }
};