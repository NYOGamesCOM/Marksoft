const Command = require("../../structures/Command");
const { MessageEmbed } = require("discord.js");
module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: "cc",
            description: "Create commands",
            category: "twitch",
            guildOnly: true,
            ownerOnly: true,
            cooldown: 3,
            usage: "!cc <commandName> <response>",
        });
    }
    async run(message) {
        const embed = new MessageEmbed()
          .setColor("RED")
          .setDescription(`This command can only be used in twitch chat!`);
          await message.reply({ embeds: [embed] });
    }
};
