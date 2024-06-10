const Command = require("../../structures/Command");
const { MessageEmbed } = require("discord.js");
const fs = require('fs');
const path = require('path');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: "leaderboard",
            aliases: ["lb"],
            description: "Shows the naughty leaderboard",
            category: "Fun",
            guildOnly: true,
        });
    }

    async run(message, args) {
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
            return message.channel.send('There was an error reading the leaderboard data.');
        }

        // Sort users by the counter in descending order
        users.sort((a, b) => b.counter - a.counter);

        // Create a leaderboard message
        let leaderboardMessage = "**Top 10**\n\n";
        if (users.length === 0) {
            leaderboardMessage += "No one has hit the magic number 69 yet!";
        } else {
            users.slice(0, 10).forEach((user, index) => {
                leaderboardMessage += `**${index + 1}.** ${user.username} - ${user.counter} times\n`;
            });
        }

        const embed = new MessageEmbed()
            .setTitle('**Special Naughty Achievement Leaderboard**')
            .setDescription(leaderboardMessage)
            .setColor('#FFD700') // Gold color for leaderboard
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });
    }
};
