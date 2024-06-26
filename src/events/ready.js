const logger = require("../utils/logger");
const Event = require("../structures/Event");
const Discord = require("discord.js");
const config = require("../../config.json");
const Guild = require("../database/schemas/Guild");
const WelcomeModule = require("../database/schemas/welcome");
const LeaveModule = require("../database/schemas/leave");
const { WebhookClient } = require("discord.js");
const premiumrip = new WebhookClient({ url: config.webhooks.premium });
const Message = require("../utils/other/message");
const { Handler } = require("discord-slash-command-handler");
module.exports = class extends Event {
  async run() {
    Message(this.client);

    new Handler(this.client, {
      commandFolder: "./src/slash",
      commandType: "file",
      allSlash: true,
      handleSlash: true,
    });

    logger.info(
      `${this.client.user.tag} is ready to serve ${this.client.guilds.cache.size} guilds.`,
      { label: "Ready" }
    );

    setInterval(async () => {
      const conditional = {
        isPremium: "true",
      };
      const results = await Guild.find(conditional);

      if (results && results.length) {
        for (const result of results) {
          if (
            Number(result.premium.redeemedAt) >=
            Number(result.premium.expiresAt)
          ) {
            const guildPremium = this.client.guilds.cache.get(result.guildId);
            if (guildPremium) {
              const user = await this.client.users.cache.get(
                result.premium.redeemedBy.id
              );

              if (user) {
                const embed = new Discord.MessageEmbed()
                  .setColor(this.client.color.red)
                  .setDescription(
                    `Hey ${user.username}, Premium in ${guildPremium.name} has Just expired :(\n\n__You can you re-new your server here! [http://localhost:3000/premium](http://localhost:3000/premium)__\n\nThank you for purchasing premium Previously! We hope you enjoyed what you purchased.\n\n**- Marksoft**`
                  );

                user.send({ embeds: [embed] }).catch(() => { });
              }

              const rip = new Discord.MessageEmbed()
                .setDescription(
                  `**Premium Subscription**\n\n**Guild:** ${guildPremium.name
                  } | **${guildPremium.id}**\nRedeemed by: ${user.tag || "Unknown"
                  }\n**Plan:** ${result.premium.plan}`
                )
                .setColor("RED")
                .setTimestamp();

              await premiumrip
                .sendCustom({
                  username: "Marksoft Loose Premium",
                  avatarURL: `${this.client.domain}/logo.png`,
                  embeds: [rip],
                })
                .catch(() => { });

              result.isPremium = "false";
              result.premium.redeemedBy.id = null;
              result.premium.redeemedBy.tag = null;
              result.premium.redeemedAt = null;
              result.premium.expiresAt = null;
              result.premium.plan = null;

              // Update the welcome message in the welcome module
              const welcomeConfig = await WelcomeModule.findOne({ guildId: result.guildId });
              if (welcomeConfig) {
                welcomeConfig.welcomeMessage = "Welcome {user} to {guild}! We now have {memberCount} members!";
                await welcomeConfig.save().catch(() => { });
              }

              // Update the leave message in the leave module
              const leaveConfig = await LeaveModule.findOne({ guildId: result.guildId });
              if (leaveConfig) {
                leaveConfig.leaveMessage = "{user_tag} just left {guild}, we now have {memberCount} members!";
                await leaveConfig.save().catch(() => { });
              }
              
              // Reset suggestion footer message
              result.suggestion.footer = "Suggested by {user_tag}";
              await result.save().catch(() => { });
            }
          }
        }
      }
    }, 86400000);

    if (config.dashboard === "true") {
      const Dashboard = require("../dashboard/dashboard");
      Dashboard(this.client);
    }
  }
};
