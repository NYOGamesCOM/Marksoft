/* MADE FOR BANKAI COMMUNITY */

const Command = require("../../structures/Command");
const { MessageEmbed, WebhookClient } = require("discord.js");
const path = require('path');
const fs = require("node:fs");

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: "naughty",
            aliases: ["69", "xxxrng"],
            description: "Naughty 69 RNG",
            category: "fun",
            usage: "",
            guildOnly: true,
            cooldown: 3,
        });
    }

    async run(message) {
        const randomNumber = Math.floor(Math.random() * 69) + 1;
        let responseMessage = `**${message.member.displayName}** is **${randomNumber}** out of **69** naughty!\n`;

        if (randomNumber === 69) {
            responseMessage += '\n Congratulations!';
            
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

            if (!data[message.guild.id]) {
                data[message.guild.id] = { webhook: "", users: [] };
            }

            const guildData = data[message.guild.id];

            let guildUsers = guildData.users;
            const userIndex = guildUsers.findIndex(user => user.userId === message.author.id);

            if (userIndex !== -1) {
                guildUsers[userIndex].counter += 1;
            } else {
                guildUsers.push({
                    username: message.author.username,
                    userId: message.author.id,
                    counter: 1,
                    date: new Date().toISOString(),
                });
            }

            try {
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
                console.log('User data updated in naughty_users.json');
            } catch (err) {
                console.error('Error writing to the JSON file:', err);
            }

            if (guildData.webhook) {
                const webhookClient = new WebhookClient({ url: guildData.webhook });

                const embedWebhook = new MessageEmbed()
                    .setTitle('Special Naughty Achievement')
                    .setDescription(`\n **${message.member.displayName}** hit the magic number **69**!`)
                    .setColor('#FF4500') // Bright orange color
                    .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                    .setFooter({
                        text: `Triggered by ${message.author.username}`,
                        iconURL: message.author.displayAvatarURL({ dynamic: true }),
                    })
                    .setTimestamp();

                webhookClient.send({
                    username: 'Naughty Achievement',
                    avatarURL: 'https://i.imgur.com/sFoSPK7.png', 
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
    }
};
