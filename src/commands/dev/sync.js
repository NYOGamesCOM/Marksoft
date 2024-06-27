const Command = require("../../structures/Command");
const { MessageEmbed } = require("discord.js");
const path = require('path');
const fs = require("fs");

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: "syncronize",
            aliases: ["sync"],
            description: "Syncronize the naughty counter for a specified user",
            category: "dev",
            usage: "<username>",
            guildOnly: true,
            cooldown: 3,
        });
    }

    async run(message) {
        // Extract arguments from the message
        const args = message.content.split(' ').slice(1);
        if (!args.length) {
            return message.reply('Please provide a username.');
        }
        const targetUsername = args.join(' ').toLowerCase();

        const filePath = path.join(__dirname, '../../../naughty_users.json');
        let data = {};

        // Read existing data from JSON file
        try {
            if (fs.existsSync(filePath)) {
                const fileData = fs.readFileSync(filePath, 'utf8');
                data = JSON.parse(fileData);
            }
        } catch (err) {
            console.error('Error reading the JSON file:', err);
            return message.reply('There was an error reading the leaderboard data.');
        }

        // Extract guild ID
        const guildId = message.guild.id;

        // Initialize guild data if not present
        if (!data[guildId]) {
            data[guildId] = { webhook: "", users: [] };
        }

        const guildData = data[guildId];
        let guildUsers = guildData.users;

        // Find user in the JSON by username
        let user = guildUsers.find(u => u.username.toLowerCase() === targetUsername);

        if (user) {
            user.counter += 1;
        } else {
            return message.reply(`No user found with the username "${targetUsername}" in the leaderboard.`);
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
            .setTitle('Syncronize twitch-discord usernames')
            .setDescription(`**${user.username}**'s win on twitch has been syncronized with the leaderboard`)
            .setColor('#00FF00')
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            .setFooter({
                text: `Syncronized by ${message.author.username}`,
                iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });
    }
};
