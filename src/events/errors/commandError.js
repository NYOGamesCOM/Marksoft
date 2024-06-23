const Event = require("../../structures/Event");
const Discord = require("discord.js");
const config = require("../../../config.json");
const webhookClient = new Discord.WebhookClient({ url: config.webhooks.errors });

module.exports = class extends Event {
  async run(error, message) {
    console.error(error);

    if (
      message.channel &&
      message.channel.viewable &&
      message.channel
        .permissionsFor(message.guild.me)
        .has(["SEND_MESSAGES", "EMBED_LINKS"])
    ) {
      message.channel
        .sendCustom(
          `:x: Hey! An error just occured, make sure to report it in #support`
        )
        .catch(() => { });
    }

    webhookClient.sendCustom(
      `${message.author.username} (${message.author.id})\n${message.content}\n${error}`
    );
  }
};
