const Command = require("../../structures/Command");
const { MessageEmbed } = require("discord.js");
const Profile = require("../../database/models/economy/profile.js");
const { createProfile } = require("../../utils/utils.js");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "addmoney",
      aliases: ["add"],
      description: "Add money to a user's wallet!",
      category: "Economy",
      usage: "<user> <amount>",
      examples: ["addmoney @Peter 400"],
      cooldown: 3,
    });
  }

  async run(message, args) {
    const user = message.mentions.members.first();
    const amount = parseFloat(args[1]);

    if (!user) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription("Please mention a valid user.")
        ]
      });
    }

    if (isNaN(amount) || amount <= 0) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription("Please provide a valid amount of money to add.")
        ]
      });
    }

    const profile = await Profile.findOne({ userID: user.id, guildId: message.guild.id });

    if (!profile) {
      await createProfile(user, message.guild);
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor("BLURPLE")
            .setDescription(`Creating profile for ${user}. Use this command again to add money.`)
        ]
      });
    } 

    await Profile.updateOne(
      { userID: user.id, guildId: message.guild.id },
      { $inc: { wallet: amount } }
    );

    return message.channel.send({
      embeds: [
        new MessageEmbed()
          .setColor("BLURPLE")
          .setDescription(`Added $${amount.toFixed(2)} to ${user}'s wallet.`)
      ]
    });
  }
};
