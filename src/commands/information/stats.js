const Command = require("../../structures/Command");
const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
const { mem, cpu, os } = require("node-os-utils");
const { stripIndent } = require("common-tags");
const Guild = require("../../database/schemas/Guild");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "stats",
      aliases: ["s", "botinfo"],
      description: "Displays Marksoft's Statistics",
      category: "Information",
      cooldown: 3,
    });
  }

  async run(message) {
    const guildDB = await Guild.findOne({ guildId: message.guild.id });
    const language = require(`../../data/language/${guildDB.language}.json`);
    
    // Calculate uptime
    let uptime = this.client.uptime;
    let seconds = uptime / 1000;
    let days = parseInt(seconds / 86400);
    seconds %= 86400;
    let hours = parseInt(seconds / 3600);
    seconds %= 3600;
    let minutes = parseInt(seconds / 60);
    seconds = parseInt(seconds % 60);
    uptime = `${seconds}s`;
    if (days) uptime = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    else if (hours) uptime = `${hours}h ${minutes}m ${seconds}s`;
    else if (minutes) uptime = `${minutes}m ${seconds}s`;

    // Gather server stats
    let rss = process.memoryUsage().rss;
    if (rss instanceof Array) rss = rss.reduce((sum, val) => sum + val, 0);
    let heapUsed = process.memoryUsage().heapUsed;
    if (heapUsed instanceof Array) heapUsed = heapUsed.reduce((sum, val) => sum + val, 0);
    const { totalMemMb } = await mem.info();
    const serverStats = stripIndent`
      OS -- ${await os.oos()}
      CPU -- ${cpu.model()}
      Cores -- ${cpu.count()}
      CPU Usage -- ${await cpu.usage()}%
      RAM -- ${totalMemMb} MB
      RAM Usage -- ${(heapUsed / 1024 / 1024).toFixed(2)} MB
    `;

    // Gather tech stats
    const tech = stripIndent`
      Ping -- ${Math.round(message.client.ws.ping)}ms
      Uptime -- ${uptime}
      ${language.MarksoftVersion}: 2.0
      Library -- Discord.js v13.6.0
      Environment -- Node.js v16.9.1
      Servers -- ${message.client.guilds.cache.size}
      ${language.users}: ${this.client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)}
      ${language.channels}: ${message.client.channels.cache.size}
      ${language.MarksoftCommands}: ${message.client.botCommands.size}
      Aliases -- ${message.client.aliases.size}
    `;

    const devs = stripIndent`
     -------
     ${language.MarksoftDevelopers}
    13Thomas#3267
    -------
    `;

    // Embed
    const embed = new MessageEmbed()
      .setAuthor(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))
      .setTitle(`${language.MarksoftInfo}`)
      .addField(`${language.MarksoftGeneral}`, `\`\`\`css\n${tech}\`\`\``, true) // Inline if possible
      .addField(`${language.MarksoftTeam}`, `\`\`\`css\n${devs}\`\`\``, true) // Inline if possible
      .addField(`${language.MarksoftStats}`, `\`\`\`css\n${serverStats}\`\`\``, false) // Full width
      .setFooter(`Requested by ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(message.guild.me.displayHexColor);

    // Buttons
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

    const row = new MessageActionRow().addComponents(inviteButton, supportButton, dashboardButton, devTeamButton);

    message.channel.send({ embeds: [embed], components: [row] });
  }
};
