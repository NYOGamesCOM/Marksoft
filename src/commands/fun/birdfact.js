const Command = require("../../structures/Command");
const fetch = require("node-fetch");
const { MessageEmbed } = require("discord.js");
const { incrementCommandCounter } = require("../../utils/utils.js");
module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "birdfact",
      aliases: ["birdfacts", "bf"],
      description: "Generate a random useless bird facts",
      category: "fun",
      cooldown: 3,
    });
  }

  async run(message) {
    const data = await fetch("https://some-random-api.ml/facts/bird")
      .then((res) => res.json())
      .catch(() => {});

    if (!data)
      return message.channel.sendCustom(
        `The API is currently down, come back later!`
      );

    const { fact } = data;

    message.channel.sendCustom({
      embeds: [
        new MessageEmbed()

          .setColor(message.client.color.blue)
          .setDescription(`${fact}`)
          .setFooter(`Requested by ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
      ],
    });
  }
};