const Command = require("../../structures/Command");
const { MessageEmbed } = require("discord.js");
const config = require("../../../config.json");
const discord = require("discord.js");
const webhookClient = new discord.WebhookClient({ url: config.webhooks.naughty });

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: "ngty",
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
            
            // Send a webhook message when the number is 69
            const embedWebhook = new MessageEmbed()
                .setTitle('Special Naughty Achievement')
                .setDescription(`\n **${message.author.username}** hit the magic number **69**! :bankai1NaughtyCorner:`)
                .setColor('#FF4500') // Bright orange color
                .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                .setFooter({
                    text: `Triggered by ${message.author.username}`,
                    iconURL: message.author.displayAvatarURL({ dynamic: true }),
                })
                .setTimestamp();

            webhookClient.send({
                username: 'Naughty Bot',
                avatarURL: 'https://i.imgur.com/sFoSPK7.png', // Replace with your avatar URL if needed
                embeds: [embedWebhook],
            }).then(() => {
                console.log('Webhook message sent successfully!');
            }).catch(error => {
                console.error('Error sending webhook message:', error);
            });
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
        //message.delete().catch(err => console.error('Failed to delete the message:', err));
    }
};