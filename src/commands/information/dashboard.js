const Command = require("../../structures/Command");
const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "dashboard",
      description: "bot's web dashboard link",
      category: "Information",
      cooldown: 3,
    });
  }

  async run(message) {
    const dashembed = new MessageEmbed()
      .setTitle("Need the bot's dashboard link? Here you go!")
      .setDescription("http://localhost:3000/")
      .setColor("RANDOM")
      .setFooter(`Requested by ${message.author.username}`)
      .setTimestamp();

    const inviteButton = new MessageButton()
      .setStyle("LINK")
      .setLabel("Invite")
      .setURL("http://localhost:3000/invite");

    const supportButton = new MessageButton()
      .setStyle("LINK")
      .setLabel("Support Server")
      .setURL("http://localhost:3000/support");

    const dashboardButton = new MessageButton()
      .setStyle("LINK")
      .setLabel("Dashboard")
      .setURL("http://localhost:3000/");

    const devTeamButton = new MessageButton()
      .setStyle("LINK")
      .setLabel("DevTeam")
      .setURL("http://localhost:3000/team");

    const row = new MessageActionRow().addComponents(
      inviteButton,
      supportButton,
      dashboardButton,
      devTeamButton
    );

    message.channel.send({ embeds: [dashembed], components: [row] });
  }
};
