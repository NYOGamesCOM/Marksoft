const Command = require("../../structures/Command");
const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "dashboard",
      description: "Need a way to get the bot's dashboard link but don't know it? Use this to get it!",
      category: "Information",
      cooldown: 3,
    });
  }

  async run(message) {
    const dashembed = new MessageEmbed()
      .setTitle("Need the bot's dashboard link? Here you go!")
      .setDescription("https://marksoft.13thomasbot.repl.co/")
      .setColor("RANDOM")
      .setFooter(`Requested by ${message.author.username}`)
      .setTimestamp();

    const inviteButton = new MessageButton()
      .setStyle("LINK")
      .setLabel("Invite")
      .setURL("https://marksoft.13thomasbot.repl.co/invite");

    const supportButton = new MessageButton()
      .setStyle("LINK")
      .setLabel("Support Server")
      .setURL("https://marksoft.13thomasbot.repl.co/support");

    const dashboardButton = new MessageButton()
      .setStyle("LINK")
      .setLabel("Dashboard")
      .setURL("https://marksoft.13thomasbot.repl.co/");

    const devTeamButton = new MessageButton()
      .setStyle("LINK")
      .setLabel("DevTeam")
      .setURL("https://marksoft.13thomasbot.repl.co/team");

    const row = new MessageActionRow().addComponents(
      inviteButton,
      supportButton,
      dashboardButton,
      devTeamButton
    );

    message.channel.send({ embeds: [dashembed], components: [row] });
  }
};
