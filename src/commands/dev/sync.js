const { Command } = require("../../structures/Command");
const { MessageEmbed } = require("discord.js");
const path = require('path');
const fs = require("fs");

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: "sync",
            aliases: ["synclb"],
            description: "Sync leaderboard [twitch - discord]",
            category: "dev",
            usage: "",
            guildOnly: true,
            cooldown: 3,
        });
    }

    async run(message) {
        // Define the path to the JSON file
        const filePath = path.join(__dirname, '../../../naughty_users.json');
        let data = {};

        // Read the existing data from the JSON file
        try {
            if (fs.existsSync(filePath)) {
                const fileData = fs.readFileSync(filePath, 'utf8');
                data = JSON.parse(fileData);
            }
        } catch (err) {
            console.error('Error reading the JSON file:', err);
            return message.reply('There was an error reading the leaderboard data.');
        }

        // Extract guild ID and author details
        const guildId = message.guild.id;
        const userId = message.author.id;
        const username = message.author.username;

        // Initialize guild data if not present
        if (!data[guildId]) {
            data[guildId] = { webhook: "", users: [] };
        }

        const guildData = data[guildId];
        let guildUsers = guildData.users;

        // Find or create the user entry
        let user = guildUsers.find(u => u.userId === userId);

        if (user) {
            user.counter += 1;
        } else {
            guildUsers.push({
                username: username,
                userId: userId,
                counter: 1,
                date: new Date().toISOString()
            });
        }

        // Save updated data back to JSON file
        try {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        } catch (err) {
            console.error('Error writing to the JSON file:', err);
            return message.reply('There was an error updating the leaderboard data.');
        }

        // Create and send the response embed
        const embed = new MessageEmbed()
            .setTitle('Sync linked Twitch-Discord usernames')
            .setDescription(`**${message.member.displayName}** hit 69 in twitch chat and now has **${user ? user.counter : 1}** 69s!`)
            .setColor('#00FF00')
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            .setFooter({
                text: `Updated by ${message.author.username}`,
                iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });
    }
};
