const Command = require("../../structures/Command");
const { MessageEmbed } = require("discord.js");

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: "wins",
            description: "Displays the current wins counter",
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
