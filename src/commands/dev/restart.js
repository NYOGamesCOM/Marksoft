const { MessageEmbed } = require("discord.js");
const Command = require("../../structures/Command");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "restart",
      aliases: ["reboot"],
      description: "Restart the bot!",
      category: "dev",
      ownerOnly: true,
    });
  }

  async run(message) {
    const restartEmbed = new MessageEmbed()
      .setColor("#7289DA")
      .setTitle("🚀 Restarting the Bot!")
      .setDescription(
        "Please hold tight! The bot is restarting and will be back online in just a moment."
      )
      .addField("💻 Estimated Downtime", "A few seconds")
      .addField("🛠 Why?", "We're applying updates or maintenance.")
      .setFooter("Thank you for your patience! ~ Your friendly bot");

    await message.channel
      .send({ embeds: [restartEmbed] })
      .catch((err) => this.client.console.error(err));
    process.exit(1);
  }
};
