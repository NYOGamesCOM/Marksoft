/* eslint-disable no-useless-escape */
const Command = require("../../structures/Command");
const { MessageEmbed, WebhookClient } = require("discord.js");
const path = require('path');
const fs = require("fs");

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: "naughty",
            aliases: ["69", "xxxrng"],
            description: "How naughty am I feeling today",
            category: "fun",
            usage: "",
            guildOnly: true,
            cooldown: 3,
        });
        this.allowedChannelID = '964565502578016266';
    }

    async run(message) {
        if (message.channel.id !== this.allowedChannelID) {
            return message.reply(`This command can only be used in <#${this.allowedChannelID}>.`);
        }
        const randomNumber = Math.floor(Math.random() * 70);
        const guessedNumber = parseInt(message.content.split(' ')[1]); // Extract guessed number from message

        let responseMessage = `**${message.member.displayName}** is **${randomNumber}** out of **69** naughty!\n`;

        if (guessedNumber === randomNumber && randomNumber === 69) {
            responseMessage += `\n🎉 Congratulations ${message.author.username}! You guessed the number **${randomNumber}** correctly and hit the magic number **69**! 😈`;
            sendSpecialMessageToWebhook(message, message.member.displayName, randomNumber);
        }
        else if (guessedNumber === randomNumber) {
            responseMessage += `\n🎉 Congratulations ${message.author.username}! You guessed the number **${randomNumber}** correctly! 🎉`;
            //sendGuessMessageToWebhook(message, message.author.username, randomNumber); // Call function to send special message
        } 
        else if (randomNumber === 69) {
            
            responseMessage += '\n \`😈 Congratulations! 😈\` \n';
            sendSpecialMessageToWebhook(message, message.member.displayName, randomNumber); // Call function to send special message
        }

        const embed = new MessageEmbed()
            .setTitle('Naughty Meter')
            .setDescription(responseMessage)
            .setColor(getRandomColor())
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            .setFooter({
                text: `Requested by ${message.author.username}`,
                iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });
    }
};

function getRandomColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}

function sendSpecialMessageToWebhook(message, username, number) {
    const filePath = path.join(__dirname, "../../../naughty_users.json");
    let data = {};

    // Read existing data from JSON file
    try {
        if (fs.existsSync(filePath)) {
            const fileData = fs.readFileSync(filePath, 'utf8');
            data = JSON.parse(fileData);
        }
    } catch (err) {
        console.error('Error reading the JSON file:', err);
        return;
    }

    // Extract guild ID
    const guildId = message.guild.id;

    // Initialize guild data if not present
    if (!data[guildId]) {
        data[guildId] = { webhook: "", users: [] };
    }

    const guildData = data[guildId];
    let guildUsers = guildData.users;

    // Find or create the user entry
    const userId = message.author.id;
    let user = guildUsers.find(user => user.userId === userId);

    if (user) {
        user.counter += 1;
        // Ensure the twitch field is present in the user data
        //if (!user.hasOwnProperty('twitch')) {
        if (!Object.prototype.hasOwnProperty.call(user, 'twitch')) {
            user.twitch = ""; // Initialize if not present
        }
    } else {
        user = {
            username: message.author.username,
            userId: userId,
            counter: 1,
            date: new Date().toISOString(),
            twitch: "" // Initialize the twitch field
        };
        guildUsers.push(user);
    }

    // Save updated data back to JSON file
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log('User data updated in naughty_users.json');
    } catch (err) {
        console.error('Error writing to the JSON file:', err);
    }

    // Send a message to the webhook if configured
    if (guildData.webhook) {
        const webhookClient = new WebhookClient({ url: guildData.webhook });

        const embedWebhook = new MessageEmbed()
            .setTitle('Special Naughty Achievement')
            .setDescription(`\n **${username}** hit the magic number **${number}**!`)
            .setColor('#FF4500') // Bright orange color
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            .setFooter({
                text: `Triggered by ${username}`,
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
        console.warn(`No webhook set for guild ${guildId}`);
    }
}