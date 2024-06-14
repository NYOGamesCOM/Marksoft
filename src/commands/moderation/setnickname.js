const Command = require("../../structures/Command");
const { MessageEmbed } = require("discord.js");
const Logging = require("../../database/schemas/logging.js");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "setnickname",
      aliases: ["nickname", "nick", "nn"],
      description: "Changes the provided user's nickname to the one specified.",
      category: "Moderation",
      usage: "<user> [reason]",
      examples: [
        "setnickname @Thomas WarlordGodGamer",
        'setnickname @Thomas "this is a nickname" ',
      ],
      guildOnly: true,
      botPermission: ["SEND_MESSAGES", "EMBED_LINKS", "MANAGE_NICKNAMES"],
      userPermission: ["MANAGE_NICKNAMES"],
    });
  }

  async run(message, args) {
    const client = message.client;
    const fail = client.emoji.fail;
    const success = client.emoji.success;
    const logging = await Logging.findOne({ guildId: message.guild.id });

    const member =
      getMemberFromMention(message, args[0]) ||
      message.guild.members.cache.get(args[0]);

    if (!member)
      return message.channel.sendCustom({
        embeds: [
          new MessageEmbed()
            .setAuthor(
              `${message.author.tag}`,
              message.author.displayAvatarURL({ dynamic: true })
            )
            .setTitle(`${fail} Set Nickname Error`)
            .setDescription("Please provide a valid user mention / user ID")
            .setTimestamp()
            .setFooter(`Requested by ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
            .setColor(message.guild.me.displayHexColor),
        ],
      });
    if (
      member.roles.highest.position >= message.member.roles.highest.position &&
      member != message.member
    )
      return message.channel.sendCustom({
        embeds: [
          new MessageEmbed()
            .setAuthor(
              `${message.author.tag}`,
              message.author.displayAvatarURL({ dynamic: true })
            )
            .setTitle(`${fail} Set Nickname Error`)
            .setDescription(
              "The provided user has either an equal or higher role."
            )
            .setTimestamp()
            .setFooter(`Requested by ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
            .setColor(message.guild.me.displayHexColor),
        ],
      });

    if (!args[1])
      return message.channel.sendCustom({
        embeds: [
          new MessageEmbed()
            .setAuthor(
              `${message.author.tag}`,
              message.author.displayAvatarURL({ dynamic: true })
            )
            .setTitle(`${fail} Set Nickname Error`)
            .setDescription("Please provide a new Nickname")
            .setTimestamp()
            .setFooter(`Requested by ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
            .setColor(message.guild.me.displayHexColor),
        ],
      });

    let nickname = args[1];
    if (nickname.startsWith('"')) {
      nickname = message.content.slice(message.content.indexOf(args[1]) + 1);
      if (!nickname.includes('"'))
        return message.channel.sendCustom({
          embeds: [
            new MessageEmbed()
              .setAuthor(
                `${message.author.tag}`,
                message.author.displayAvatarURL({ dynamic: true })
              )
              .setTitle(`${fail} Set Nickname Error`)
              .setDescription(
                `Make sure the nickname is surrounded in Quotes, **"text"**`
              )
              .setTimestamp()
              .setFooter(`Requested by ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
              .setColor(message.guild.me.displayHexColor),
          ],
        });
      nickname = nickname.slice(0, nickname.indexOf('"'));
      if (!nickname.replace(/\s/g, "").length)
        return message.channel.sendCustom({
          embeds: [
            new MessageEmbed()
              .setAuthor(
                `${message.author.tag}`,
                message.author.displayAvatarURL({ dynamic: true })
              )
              .setTitle(`${fail} Set Nickname Error`)
              .setDescription("Provide a Nickname")
              .setTimestamp()
              .setFooter(`Requested by ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
              .setColor(message.guild.me.displayHexColor),
          ],
        });
    }

    if (nickname.length > 32) {
      return message.channel.sendCustom({
        embeds: [
          new MessageEmbed()
            .setAuthor(
              `${message.author.tag}`,
              message.author.displayAvatarURL({ dynamic: true })
            )
            .setTitle(`${fail} Set Nickname Error`)
            .setDescription("Make sure that nickname is below 32 characters")
            .setTimestamp()
            .setFooter(`Requested by ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
            .setColor(message.guild.me.displayHexColor),
        ],
      });
    } else {
      let reason;
      if (args[1].startsWith('"'))
        reason = message.content.slice(
          message.content.indexOf(nickname) + nickname.length + 1
        );
      else
        reason = message.content.slice(
          message.content.indexOf(nickname) + nickname.length
        );
      if (!reason) reason = "No reason Provided";
      if (reason.length > 1024) reason = reason.slice(0, 1021) + "...";

      try {
        const oldNickname = member.nickname || "None";
        await member.setNickname(nickname);
        const embed = new MessageEmbed()

          .setDescription(
            `${success} | **${oldNickname}**'s nickname was set to **${nickname}** ${logging && logging.moderation.include_reason === "true"
              ? `\n\n**Reason:** ${reason}`
              : ``
            }`
          )
          .setColor(message.guild.me.displayHexColor);
        message.channel
          .sendCustom({ embeds: [embed] })
          .then(async (s) => {
            if (logging && logging.moderation.delete_reply === "true") {
              setTimeout(() => {
                s.delete().catch(() => { });
              }, 5000);
            }
          })
          .catch(() => { });

        if (logging) {
          if (logging.moderation.delete_after_executed === "true") {
            message.delete().catch(() => { });
          }

          const role = message.guild.roles.cache.get(
            logging.moderation.ignore_role
          );
          const channel = message.guild.channels.cache.get(
            logging.moderation.channel
          );

          if (logging.moderation.toggle == "true") {
            if (channel) {
              if (message.channel.id !== logging.moderation.ignore_channel) {
                if (
                  !role ||
                  (role &&
                    !message.member.roles.cache.find(
                      (r) => r.name.toLowerCase() === role.name
                    ))
                ) {
                  if (logging.moderation.nicknames == "true") {
                    let color = logging.moderation.color;
                    if (color == "#000000") color = message.client.color.yellow;

                    let logcase = logging.moderation.caseN;
                    if (!logcase) logcase = `1`;

                    let reason;

                    if (args[1].startsWith('"')) {
                      reason = message.content.slice(
                        message.content.indexOf(nickname) + nickname.length + 1
                      );
                    } else {
                      reason = message.content.slice(
                        message.content.indexOf(nickname) + nickname.length
                      );
                    }
                    if (!reason) reason = "No reason Provided";
                    if (reason.length > 1024)
                      reason = reason.slice(0, 1021) + "...";

                    const logEmbed = new MessageEmbed()
                      .setAuthor(
                        `Action: \`set Nickname\` | ${member.user.tag} | Case #${logcase}`,
                        member.user.displayAvatarURL({ format: "png" })
                      )
                      .addField("User", `${member}`, true)
                      .addField("Moderator", `${message.member}`, true)
                      .addField("Reason", `${reason}`, true)
                      .setFooter({ text: `ID: ${member.id}` })
                      .setTimestamp()
                      .setColor(color);

                    channel.send({ embeds: [logEmbed] }).catch(() => { });

                    logging.moderation.caseN = logcase + 1;
                    await logging.save().catch(() => { });
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        message.client.logger.error(err.stack);
        message.channel.sendCustom({
          embeds: [
            new MessageEmbed()
              .setAuthor(
                `${message.author.tag}`,
                message.author.displayAvatarURL({ dynamic: true })
              )
              .setTitle(`${fail} Set Nickname Error`)
              .setDescription(
                `Please ensure my role is above the provided user's role.`
              )
              .setTimestamp()
              .setFooter(`Requested by ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
              .setColor(message.guild.me.displayHexColor),
          ],
        });
      }
    }
  }
};
function getMemberFromMention(message, mention) {
  if (!mention) return;
  const matches = mention.match(/^<@!?(\d+)>$/);
  if (!matches) return;
  const id = matches[1];
  return message.guild.members.cache.get(id);
}
