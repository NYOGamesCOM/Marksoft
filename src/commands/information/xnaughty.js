const Command = require("../../structures/Command");
const { MessageEmbed } = require("discord.js");
const config = require("../../../config.json");
const discord = require("discord.js");
const webhookClient = new discord.WebhookClient({ url: config.webhooks.naughty });
const path = require('path');
const fs = require("node:fs");

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

        let responseMessage = `**${message.author.username}** is **${randomNumber}** out of **69** naughty!\n`;

        if (randomNumber === 69) {
            responseMessage += '\n Congratulations!';
            
            // Send a webhook message when the number is 69
            const embedWebhook = new MessageEmbed()
                .setTitle('Special Naughty Achievement')
                .setDescription(`\n **${message.author.username}** hit the magic number **69**!`)
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

            // Store the username and counter in a JSON file
            const filePath = path.join(__dirname, "../../../naughty_users.json");
            let users = [];

            // Read existing data from the file
            try {
                if (fs.existsSync(filePath)) {
                    const fileData = fs.readFileSync(filePath, 'utf8');
                    users = JSON.parse(fileData);
                }
            } catch (err) {
                console.error('Error reading the JSON file:', err);
            }

            // Check if the user already exists
            const userIndex = users.findIndex(user => user.userId === message.author.id);

            if (userIndex !== -1) {
                // User exists, increment the counter
                users[userIndex].counter += 1;
            } else {
                // New user, add them with a counter of 1
                users.push({
                    username: message.author.username,
                    userId: message.author.id,
                    counter: 1,
                    date: new Date().toISOString()
                });
            }

            // Write updated data back to the file
            try {
                fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf8');
                console.log('User data updated in naughty_users.json');
            } catch (err) {
                console.error('Error writing to the JSON file:', err);
            }
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