/* MADE FOR BANKAI COMMUNITY */

const Command = require("../../structures/Command");
const { MessageEmbed, WebhookClient } = require("discord.js");
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

        // Increment command usage counter
        //this.incrementCommandUsage(message.guild.id);
        this.incrementCommandUsage(message.guild.id, message.author.id);

        if (randomNumber === 69) {
            responseMessage += '\n Congratulations!';
            
            // File path for storing naughty user data
            const filePath = path.join(__dirname, "../../../naughty_users.json");
            let data = {};

            // Read existing data from the file
            try {
                if (fs.existsSync(filePath)) {
                    const fileData = fs.readFileSync(filePath, 'utf8');
                    data = JSON.parse(fileData);
                }
            } catch (err) {
                console.error('Error reading the JSON file:', err);
            }

            // Ensure data structure exists for the current guild
            if (!data[message.guild.id]) {
                data[message.guild.id] = { webhook: "", users: [] };
            }

            // Get guild data
            const guildData = data[message.guild.id];

            // Find or create user entry
            let guildUsers = guildData.users;
            const userIndex = guildUsers.findIndex(user => user.userId === message.author.id);

            if (userIndex !== -1) {
                // User exists, increment the counter
                guildUsers[userIndex].counter += 1;
            } else {
                // New user, add them with a counter of 1
                guildUsers.push({
                    username: message.author.username,
                    userId: message.author.id,
                    counter: 1,
                    date: new Date().toISOString()
                });
            }

            // Write updated data back to the file
            try {
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
                console.log('User data updated in naughty_users.json');
            } catch (err) {
                console.error('Error writing to the JSON file:', err);
            }

            // Send webhook message if webhook is set
            if (guildData.webhook) {
                const webhookClient = new WebhookClient({ url: guildData.webhook });

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
                    username: 'Naughty Achievement',
                    avatarURL: 'https://i.imgur.com/sFoSPK7.png', // Replace with your avatar URL if needed
                    embeds: [embedWebhook],
                }).then(() => {
                    console.log('Special Naughty Achievement message sent successfully!');
                }).catch(error => {
                    console.error('Error sending webhook message:', error);
                });
            } else {
                console.warn(`No webhook set for guild ${message.guild.id}`);
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
    incrementCommandUsage(guildId, userId) {
        const filePath = path.join(__dirname, "../../../naughty_users.json");
        let data = {};
    
        try {
            if (fs.existsSync(filePath)) {
                const fileData = fs.readFileSync(filePath, 'utf8');
                data = JSON.parse(fileData);
            }
        } catch (err) {
            console.error('Error reading the JSON file:', err);
        }
    
        // Update usage count for the user in the guild
        if (data[guildId]) {
            const guildData = data[guildId];
            if (guildData.users) {
                const user = guildData.users.find(user => user.userId === userId);
                if (user) {
                    user.usage = (user.usage || 0) + 1;
                }
            }
        }
    
        // Write updated data back to the file
        try {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
            //console.log('User data updated in naughty_users.json');
        } catch (err) {
            console.error('Error writing to the JSON file:', err);
        }
    }
};
