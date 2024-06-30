const Command = require("../../structures/Command");
const { MessageEmbed } = require("discord.js");
module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: "channels",
            description: "Displays the channels where the bot is in.",
            category: "twitch",
            guildOnly: true,
            ownerOnly: true,
            cooldown: 3,
        });
    }
    async run(message) {
        const embed = new MessageEmbed()
        .setColor("RED")
          .setDescription(`This command can only be used in twitch chat!`);
          await message.reply({ embeds: [embed] });
    }
};
