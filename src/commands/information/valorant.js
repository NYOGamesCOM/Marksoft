const Command = require("../../structures/Command");
const { MessageEmbed } = require("discord.js");
const fetch = require("node-fetch");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "valorantstats",
      description: "Displays Valorant profile stats.",
      category: "Valorant",
      usage: "!valorantstats <username>",
      guildOnly: false, // Change to true if you want to restrict it to guilds only
    });
  }

  async run(message, args) {
    try {
      // Extracting the username from the command arguments
      const username = args.join(" ");

      // Making a request to Riot's API to get the player's stats
      const response = await fetch(`https://eu.api.riotgames.com/val/content/v1/contents?api_key=RGAPI-478a704e-e7bc-46d7-88f8-ad43cd3e632f`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      // Extracting relevant information from the response
      const level = data.yourData.level;
      const mmr = data.yourData.mmr;
      const wins = data.yourData.wins;
      const losses = data.yourData.losses;
      const winRate = (wins / (wins + losses)) * 100;

      // Constructing the response message
      const embed = new MessageEmbed()
        .setColor("#7289da")
        .setTitle(`Valorant Profile Stats - ${username}`)
        .addField("Level", level, true)
        .addField("MMR", mmr, true)
        .addField("Wins", wins, true)
        .addField("Losses", losses, true)
        .addField("Win Rate", `${winRate.toFixed(2)}%`, true);

      return message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      return message.channel.send('An error occurred while fetching Valorant stats.');
    }
  }
};
