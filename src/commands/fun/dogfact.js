const Command = require("../../structures/Command");
const fetch = require("node-fetch");
const { MessageEmbed } = require("discord.js");
const { incrementCommandCounter } = require("../../utils/utils.js");
module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "dogfact",
      aliases: ["df"],
      description: "Generate a random useless dog facts",
      category: "fun",
      cooldown: 3,
    });
  }

  async run(message) {
    const res = await fetch("https://dog-api.kinduff.com/api/facts");
    const fact = (await res.json()).facts[0];

    const embed = new MessageEmbed()
      .setDescription(fact)
      .setFooter(`Requested by ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(message.client.color.blue);
    message.channel.sendCustom({ embeds: [embed] }).catch(() => {});
  }
};