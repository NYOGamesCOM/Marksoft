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

    // Uptime Calculation
    const msToTime = (duration) => {
      let seconds = Math.floor((duration / 1000) % 60);
      let minutes = Math.floor((duration / (1000 * 60)) % 60);
      let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
      let days = Math.floor(duration / (1000 * 60 * 60 * 24));
      
      return `${days ? days + 'd ' : ''}${hours ? hours + 'h ' : ''}${minutes ? minutes + 'm ' : ''}${seconds}s`;
    };
    const uptime = msToTime(this.client.uptime);

    // Server Stats
    const rss = process.memoryUsage().rss;
    const heapUsed = process.memoryUsage().heapUsed;
    const { totalMemMb } = await mem.info();
    const serverStats = stripIndent`
     • OS -- ${await os.oos()}
     • CPU -- ${cpu.model()}
     • Cores -- ${cpu.count()}
     • CPU Usage -- ${await cpu.usage()}%
     • Total RAM -- ${totalMemMb} MB
     • RAM Usage -- ${(heapUsed / 1024 / 1024).toFixed(2)} MB
    `;

    // Bot Stats
    const techStats = stripIndent`
      🏓 Ping -- ${Math.round(message.client.ws.ping)}ms
      ⏱️ Uptime -- ${uptime}
      🛠️ Bot ${language.MarksoftVersion} -- 3.2.27 R4
      📚 Library -- Discord.js v13.6.0
      🌍 Environment -- Node.js v16.9.1
      🏠 Servers -- ${message.client.guilds.cache.size}
      👥 ${language.users} -- ${this.client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)}
      📝 ${language.channels} -- ${message.client.channels.cache.size}
      🧩 ${language.MarksoftCommands} -- ${message.client.botCommands.size}
      🔗 Aliases -- ${message.client.aliases.size}
    `;

    const devs = stripIndent`

      ➜ Thomas

    `;
    const contribuitors = stripIndent`
     •PETER
     •W-LEGIT
     •HOTSUOP
     •EYUM
    `;
    const staff = stripIndent`
     •SUI
     •STREAKS
     •INDOMINUS
     •CHAZ
     •SCOOPY
     •ACE
     •SLAYER
    `;
    // Embed Creation
    const embed = new MessageEmbed()
      .setAuthor({ name: message.member.displayName, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setTitle(`📊 ${language.MarksoftInfo} 📊`)
      .setDescription("Here are the current statistics for Marksoft.\n")
      .addFields(
        { name: `📈 ${language.MarksoftGeneral}`, value: `\`\`\`yaml\n${techStats}\`\`\``, inline: false },
        { name: `💻 ${language.MarksoftStats}`, value: `\`\`\`yaml\n${serverStats}\`\`\``, inline: false },
        { name: `👥 ${language.MarksoftDevelopers}`, value: `\`\`\`yaml\n${devs}\`\`\``, inline: true },
        { name: `👥 ${language.MarksoftContributor}`, value: `\`\`\`yaml\n${contribuitors}\`\`\``, inline: true },
        { name: `👥 Staff`, value: `\`\`\`yaml\n${staff}\`\`\``, inline: true }
      )
      .setThumbnail(message.guild.iconURL({ dynamic: true }) || this.client.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setTimestamp()
      .setColor("#7289DA");

    // Buttons
    const inviteButton = new MessageButton()
      .setStyle("LINK")
      .setLabel("📨 Invite Bot")
      .setURL("http://localhost:3000/invite");

    const supportButton = new MessageButton()
      .setStyle("LINK")
      .setLabel("🛠️ Support Server")
      .setURL("http://localhost:3000/support");

    const dashboardButton = new MessageButton()
      .setStyle("LINK")
      .setLabel("📊 Dashboard")
      .setURL("http://localhost:3000/");

    const devTeamButton = new MessageButton()
      .setStyle("LINK")
      .setLabel("🧑‍💻 DevTeam")
      .setURL("http://localhost:3000/team");

    const row = new MessageActionRow().addComponents(inviteButton, supportButton, dashboardButton, devTeamButton);

    message.channel.send({ embeds: [embed], components: [row] });
  }
};
