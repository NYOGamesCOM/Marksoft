const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
  .setName("dashboard")
  .setDescription("Need help getting to the dashboard of Marksoft? Use this command!"),
  async execute(interaction) {
    const dashembed = new MessageEmbed()
    .setTitle("Need Marksoft's dashboard link?")
    .setDescription("Click [here](https://Marksoft.ro) to see Marksoft's dashboard")
    .setColor("RANDOM")
    .setFooter({ text: `Requested by ${interaction.author}` })
    .setTimestamp();
    interaction.reply({ embeds: [dashembed], ephemeral: true });
  }
}
