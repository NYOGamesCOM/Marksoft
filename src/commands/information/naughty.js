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
        // Generate a random number between 1 and 69
        const randomNumber = Math.floor(Math.random() * 69) + 1;

        // Create the base message
        let responseMessage = `**${message.author.username}** is **${randomNumber}** out of **69** naughty :KEKW: \n`;

        // Add a congratulatory message if the number is 69
        if (randomNumber === 69) {
            responseMessage += '\n🎉 Congratulations! You hit the lucky number 69! 🎉';
        }

        // Create the embed message
        const embed = new MessageEmbed()
            .setTitle('Naughty calculator 101')
            .setDescription(responseMessage)
            .setColor('#0099ff')
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            .setFooter({
                text: `Requested by ${message.author.username}`,
                iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setTimestamp();

        // Send the embed message to the channel
        await message.channel.send({ embeds: [embed] });
        message.delete().catch(err => console.error('Failed to delete the message:', err));
    }
};