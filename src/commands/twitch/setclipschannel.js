const Command = require("../../structures/Command");
const { MessageEmbed } = require("discord.js");
module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: "setclipschannel",
            description: "Set where the clips are displayed",
            usage: "!setclipschannel [discord channel id]",
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
