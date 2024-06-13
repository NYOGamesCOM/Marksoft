const { MessageEmbed } = require("discord.js");
const Command = require("../../structures/Command");
const Guild = require("../../database/schemas/Guild");
const { stripIndent } = require("common-tags");
const emojis = require("../../assets/emojis.json");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "help",
      aliases: ["menu", "bothelp", "commands"],
      description: "Shows you every available command in the guild",
      category: "Information",
      usage: "[command]",
      examples: ["help userinfo", "help avatar"],
      cooldown: 3,
    });
  }

  async run(message, args) {
    const guildDB = await Guild.findOne({ guildId: message.guild.id });

    let disabledCommands = guildDB.disabledCommands;
    if (typeof disabledCommands === "string")
      disabledCommands = disabledCommands.split(" ");

    const prefix = guildDB.prefix;

    const emoji = {
      altdetector: `${emojis.altdetector}`,
      applications: `${emojis.applications}`,
      config: `${emojis.config}`,
      utility: `${emojis.utility}`,
      economy: `${emojis.economy}`,
      fun: `${emojis.fun}`,
      images: `${emojis.images}`,
      information: `${emojis.information}`,
      moderation: `${emojis.moderation}`,
      reactionrole: `${emojis.reactionrole}`,
      tickets: `${emojis.tickets}`,
      owner: `${emojis.owner}`,
    };

    const green = ":purple_circle: ";
    const red = ":red_circle: ";

    const embed = new MessageEmbed().setColor("PURPLE");

    if (!args || args.length < 1) {
      let categories;
      categories = this.client.utils.removeDuplicates(
        this.client.botCommands
          .filter((cmd) => cmd.category !== "Owner")
          .map((cmd) => cmd.category)
      );

      if (this.client.config.developers.includes(message.author.id))
        categories = this.client.utils.removeDuplicates(
          this.client.botCommands.map((cmd) => cmd.category)
        );

      for (const category of categories) {
        embed.addField(
          `**${capitalize(
            category
          )}**`,
          `\`${prefix}help ${category.toLowerCase()}\``,
          true
        );
      }

      embed.setTitle(`Marksoft's command List`);
      embed.setDescription(stripIndent`
        The Prefix for this server is \`${prefix}\`

        `);

      embed.setFooter({
        text: `Requested by ${message.author.username}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      });
      embed.setTimestamp();

      embed.addField(
        "\u200b",
        "**[Invite](http://localhost:3000/invite) | " +
        "[Support Server](http://localhost:3000/support) | " +
        "[Dashboard](http://localhost:3000/)**"
      );
      return message.channel.sendCustom({ embeds: [embed] });
    } else if (
      (args && args.join(" ").toLowerCase() == "alt detector") ||
      (args && args[0].toLowerCase() == "alt")
    ) {
      embed.setTitle(`Alt Detector`);
      embed.setDescription(
        this.client.botCommands
          .filter((cmd) => cmd.category.toLowerCase() === "alt detector")
          .map(
            (cmd) =>
              `${cmd.disabled || disabledCommands.includes(cmd.name || cmd)
                ? red
                : green
              } \`${cmd.name} ${" ".repeat(9 - Number(cmd.name.length))}:\` ${cmd.description
              }`
          )
          .join("\n")
      );

      embed.setFooter({
        text: `Requested by ${message.author.username}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      });
      embed.setTimestamp();
      embed.addField(
        "\u200b",
        "**[Invite](http://localhost:3000/invite) | " +
        "[Support Server](http://localhost:3000/support) | " +
        "[Dashboard](http://localhost:3000/)**"
      );
      return message.channel.sendCustom({ embeds: [embed] });
    } else if (args && args[0].toLowerCase() == "owner") {
      if (!this.client.config.developers.includes(message.author.id))
        return message.channel.sendCustom(
          `:x: You are not allowed to view this category`
        );

      embed.setTitle(`Owner Commands`);
      embed.setDescription(
        this.client.botCommands
          .filter((cmd) => cmd.category.toLowerCase() === "owner")
          .map(
            (cmd) =>
              `${cmd.disabled || disabledCommands.includes(cmd.name || cmd)
                ? red
                : green
              } \`${cmd.name} ${" ".repeat(11 - Number(cmd.name.length))}:\` ${cmd.description
              }`
          )
          .join("\n")
      );

      embed.setFooter({
        text: `Requested by ${message.author.username}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      });

      embed.setTimestamp();
      embed.addField(
        "\u200b",
        "**[Invite](http://localhost:3000/invite) | " +
        "[Support Server](http://localhost:3000/support) | " +
        "[Dashboard](http://localhost:3000/)**"
      );
      return message.channel.sendCustom({ embeds: [embed] });
    } else if (
      (args && args[0].toLowerCase() == "applications") ||
      (args && args[0].toLowerCase() == "apps")
    ) {
      embed.setTitle(` Applications`);
      embed.setDescription(
        this.client.botCommands
          .filter((cmd) => cmd.category.toLowerCase() === "applications")
          .map(
            (cmd) =>
              `${cmd.disabled || disabledCommands.includes(cmd.name || cmd)
                ? red
                : green
              } \`${cmd.name} ${" ".repeat(11 - Number(cmd.name.length))}:\` ${cmd.description
              }`
          )
          .join("\n")
      );

      embed.setFooter({
        text: `Requested by ${message.author.username}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      });

      embed.setTimestamp();

      embed.addField(
        "\u200b",
        "**[Invite](http://localhost:3000/invite) | " +
        "[Support Server](http://localhost:3000/support) | " +
        "[Dashboard](http://localhost:3000/)**"
      );

      return message.channel.sendCustom({ embeds: [embed] });
    } else if (
      (args && args[0].toLowerCase() == "config") ||
      (args && args[0].toLowerCase() == "configuration")
    ) {
      embed.setTitle(`Config`);
      embed.setDescription(
        this.client.botCommands
          .filter((cmd) => cmd.category.toLowerCase() === "config")
          .map(
            (cmd) =>
              `${cmd.disabled || disabledCommands.includes(cmd.name || cmd)
                ? red
                : green
              } \`${cmd.name} ${" ".repeat(14 - Number(cmd.name.length))}:\` ${cmd.description
              }`
          )
          .join("\n")
      );

      embed.setFooter({
        text: `Requested by ${message.author.username}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      });

      embed.setTimestamp();
      embed.addField(
        "\u200b",
        "**[Invite](http://localhost:3000/invite) | " +
        "[Support Server](http://localhost:3000/support) | " +
        "[Dashboard](http://localhost:3000/)**"
      );
      return message.channel.sendCustom({ embeds: [embed] });
    } else if (
      (args && args[0].toLowerCase() == "utility") ||
      (args && args[0].toLowerCase() == "utils")
    ) {
      embed.setTitle(`Utility`);
      embed.setDescription(
        this.client.botCommands
        .filter((cmd) => cmd.category.toLowerCase() === "utility")
        .map((cmd) => {
          const name = cmd.name;
          const count = 10 - name.length;
          console.log(`Name: ${name}, Count: ${count}`);
          const indentation = " ".repeat(count >= 0 ? count : 0);
  
          return `${
            cmd.disabled || disabledCommands.includes(name) ? red : green
          } \`${name}${indentation}:\` ${cmd.description}`;
        })
          .join("\n")
      );

      embed.setFooter({
        text: `Requested by ${message.author.username}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      });

      embed.setTimestamp();
      embed.addField(
        "\u200b",
        "**[Invite](http://localhost:3000/invite) | " +
        "[Support Server](http://localhost:3000/support) | " +
        "[Dashboard](http://localhost:3000/)**"
      );
      return message.channel.sendCustom({ embeds: [embed] });
    } else if (args && args[0].toLowerCase() == "fun") {
      embed.setTitle(`Fun`);
      embed.setDescription(
        this.client.botCommands
          .filter((cmd) => cmd.category.toLowerCase() === "fun")
          .map(
            (cmd) =>
              `${cmd.disabled || disabledCommands.includes(cmd.name || cmd)
                ? red
                : green
              } \`${cmd.name} ${" ".repeat(11 - Number(cmd.name.length))}:\` ${cmd.description
              }`
          )
          .join("\n")
      );

      embed.setFooter({
        text: `Requested by ${message.author.username}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      });

      embed.setTimestamp();
      embed.addField(
        "\u200b",
        "**[Invite](http://localhost:3000/invite) | " +
        "[Support Server](http://localhost:3000/support) | " +
        "[Dashboard](http://localhost:3000/)**"
      );
      return message.channel.sendCustom({ embeds: [embed] });
    } else if (args && args[0].toLowerCase() == "premium") {
      embed.setTitle(`Premium`);
      embed.setDescription(
        this.client.botCommands
          .filter((cmd) => cmd.category.toLowerCase() === "premium")
          .map(
            (cmd) =>
              `${cmd.disabled || disabledCommands.includes(cmd.name || cmd)
                ? red
                : green
              } \`${cmd.name} ${" ".repeat(14 - Number(cmd.name.length))}:\` ${cmd.description
              }`
          )
          .join("\n")
      );

      embed.setFooter({
        text: `Requested by ${message.author.username}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      });

      embed.setTimestamp();
      embed.addField(
        "\u200b",
        "**[Invite](http://localhost:3000/invite) | " +
        "[Support Server](http://localhost:3000/support) | " +
        "[Dashboard](http://localhost:3000/)**"
      );
      return message.channel.sendCustom({ embeds: [embed] });
    } else if (args && args[0].toLowerCase() == "youtube") {
      embed.setTitle(`YouTube - BETA!`);
      embed.setDescription(
        this.client.botCommands
          .filter((cmd) => cmd.category.toLowerCase() === "youtube")
          .map(
            (cmd) =>
              `${cmd.disabled || disabledCommands.includes(cmd.name || cmd)
                ? red
                : green
              } \`${cmd.name} ${" ".repeat(17 - Number(cmd.name.length))}:\` ${cmd.description
              }`
          )
          .join("\n")
      );

      embed.setFooter({
        text: `Requested by ${message.author.username}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      });

      embed.setTimestamp();
      embed.addField(
        "\u200b",
        "**[Invite](http://localhost:3000/invite) | " +
        "[Support Server](http://localhost:3000/support) | " +
        "[Dashboard](http://localhost:3000/)**"
      );
      return message.channel.sendCustom({ embeds: [embed] });
    } else if (
      (args && args[0].toLowerCase() == "images") ||
      (args && args[0].toLowerCase() == "image")
    ) {
      embed.setTitle(`Image`);
      embed.setDescription(
        this.client.botCommands
          .filter((cmd) => cmd.category.toLowerCase() === "images")
          .map(
            (cmd) =>
              `${cmd.disabled || disabledCommands.includes(cmd.name || cmd)
                ? red
                : green
              } \`${cmd.name} ${" ".repeat(14 - Number(cmd.name.length))}:\` ${cmd.description
              }`
          )
          .join("\n")
      );

      embed.setFooter({
        text: `Requested by ${message.author.username}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      });

      embed.setTimestamp();
      embed.addField(
        "\u200b",
        "**[Invite](http://localhost:3000/invite) | " +
        "[Support Server](http://localhost:3000/support) | " +
        "[Dashboard](http://localhost:3000/)**"
      );
      return message.channel.sendCustom({ embeds: [embed] });
    } else if (
      (args && args[0].toLowerCase() == "information") ||
      (args && args[0].toLowerCase() == "info")
    ) {
      embed.setTitle(`Info`);
      embed.setDescription(
        this.client.botCommands
          .filter((cmd) => cmd.category.toLowerCase() === "information")
          .map(
            (cmd) =>
              `${cmd.disabled || disabledCommands.includes(cmd.name || cmd)
                ? red
                : green
              } \`${cmd.name} ${" ".repeat(11 - Number(cmd.name.length))}:\` ${cmd.description
              }`
          )
          .join("\n")
      );

      embed.setFooter({
        text: `Requested by ${message.author.username}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      });

      embed.setTimestamp();
      embed.addField(
        "\u200b",
        "**[Invite](http://localhost:3000/invite) | " +
        "[Support Server](http://localhost:3000/support) | " +
        "[Dashboard](http://localhost:3000/)**"
      );
      return message.channel.sendCustom({ embeds: [embed] });
    } else if (
      (args && args[0].toLowerCase() == "moderation") ||
      (args && args[0].toLowerCase() == "mod")
    ) {
      embed.setTitle(`Moderation`);
      embed.setDescription(
        this.client.botCommands
          .filter((cmd) => cmd.category.toLowerCase() === "moderation")
          .map(
            (cmd) =>
              `${cmd.disabled || disabledCommands.includes(cmd.name || cmd)
                ? red
                : green
              } \`${cmd.name} ${" ".repeat(11 - Number(cmd.name.length))}:\` ${cmd.description
              }`
          )
          .join("\n")
      );
      embed.setFooter({
        text: `Requested by ${message.author.username}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      });

      embed.setTimestamp();
      embed.addField(
        "\u200b",
        "**[Invite](http://localhost:3000/invite) | " +
        "[Support Server](http://localhost:3000/support) | " +
        "[Dashboard](http://localhost:3000/)**"
      );
      return message.channel.sendCustom({ embeds: [embed] });
    } else if (
      (args && args.slice(0).join(" ").toLowerCase() == "reaction role") ||
      (args && args[0].toLowerCase() == "rr")
    ) {
      embed.setTitle(`Reaction Roles`);
      embed.setDescription(
        this.client.botCommands
          .filter((cmd) => cmd.category.toLowerCase() === "reaction role")
          .map(
            (cmd) =>
              `${cmd.disabled || disabledCommands.includes(cmd.name || cmd)
                ? red
                : green
              } \`${cmd.name} ${" ".repeat(12 - Number(cmd.name.length))}:\` ${cmd.description
              }`
          )
          .join("\n")
      );

      embed.setFooter({
        text: `Requested by ${message.author.username}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      });

      embed.setTimestamp();
      embed.addField(
        "\u200b",
        "**[Invite](http://localhost:3000/invite) | " +
        "[Support Server](http://localhost:3000/support) | " +
        "[Dashboard](http://localhost:3000/)**"
      );

      return message.channel.sendCustom({ embeds: [embed] });
    } else if (
      (args && args[0].toLowerCase() == "tickets") ||
      (args && args[0].toLowerCase() == "ticketing")
    ) {
      embed.setTitle(`Tickets`);
      embed.setDescription(
        this.client.botCommands
          .filter((cmd) => cmd.category.toLowerCase() === "tickets")
          .map(
            (cmd) =>
              `${cmd.disabled || disabledCommands.includes(cmd.name || cmd)
                ? red
                : green
              } \`${cmd.name} ${" ".repeat(11 - Number(cmd.name.length))}:\` ${cmd.description
              }`
          )
          .join("\n")
      );
      embed.addField(
        "\u200b",
        "**[Invite](http://localhost:3000/invite) | " +
        "[Support Server](http://localhost:3000/support) | " +
        "[Dashboard](http://localhost:3000/)**"
      );
      embed.setFooter({
        text: `Requested by ${message.author.username}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      });

      embed.setTimestamp();

      return message.channel.sendCustom({ embeds: [embed] });
    } else {
      const cmd =
        this.client.botCommands.get(args[0]) ||
        this.client.botCommands.get(this.client.aliases.get(args[0]));

      if (!cmd)
        return message.channel.sendCustom(
          `:x: Could not find the Command you're looking for`
        );

      if (cmd.category === "Owner")
        return message.channel.sendCustom(
          `:x: Could not find the Command you're looking for`
        );

      embed.setTitle(`Command: ${cmd.name}`);
      embed.setDescription(cmd.description);
      embed.setThumbnail(`https://i.imgur.com/sFoSPK7.png`);
      embed.setFooter(
        cmd.disabled ||
          disabledCommands.includes(args[0] || args[0].toLowerCase())
          ? "This command is currently disabled."
          : message.member.displayName,
        message.author.displayAvatarURL({ dynamic: true })
      );

      embed.addField("Usage", `\`${cmd.usage}\``, true);
      embed.addField("category", `\`${capitalize(cmd.category)}\``, true);

      if (cmd.aliases && cmd.aliases.length && typeof cmd.aliases === "object")
        embed.addField(
          "Aliases",
          cmd.aliases.map((alias) => `\`${alias}\``, true).join(", "),
          true
        );
      if (cmd.cooldown && cmd.cooldown > 1)
        embed.addField("Cooldown", `\`${cmd.cooldown}s\``, true);
      if (cmd.examples && cmd.examples.length)
        embed.addField(
          "__**Examples**__",
          cmd.examples
            .map((example) => `:purple_circle:  \`${example}\``)
            .join("\n")
        );

      return message.channel.sendCustom({ embeds: [embed] });
    }
  }
};

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
