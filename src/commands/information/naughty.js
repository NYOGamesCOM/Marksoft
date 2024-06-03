const Command = require("../../structures/Command");
const { MessageEmbed } = require("discord.js");

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: "xnaughty",
            aliases: ["69", "xxxrng"],
            description: "Naughty generator",
            category: "Fun",
            usage: "randomnumber",
            guildOnly: true,
        });
    }

    async run(message, args) {

        const randomNumber = Math.floor(Math.random() * 69) + 1;

        let responseMessage = `**${message.author.username}** is **${randomNumber}** out of **69** naughty :KEKW: \n`;

        if (randomNumber === 69) {
            responseMessage += '\n :bankai1NaughtyCorner: Congratulations! :bankai1NaughtyCorner: ';
        }

        const embed = new MessageEmbed()
            .setTitle('Naughty')
            .setDescription(responseMessage)
            .setColor('#0099ff')
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            .setFooter({
                text: `Requested by ${message.author.username}`,
                iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });
        message.delete().catch(err => console.error('Failed to delete the message:', err));
    }
};