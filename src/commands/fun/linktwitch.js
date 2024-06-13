const Command = require("../../structures/Command");
const { MessageEmbed } = require("discord.js");
const path = require('path');
const fs = require("fs");

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: "linktwitch",
            aliases: ["linkmytwitch"],
            description: "Link your Twitch account with Discord",
            category: "fun",
            usage: "!linktwitch <twitchUsername>",
            guildOnly: true,
            cooldown: 3,
        });
    }

    async run(message, args) {
        // Check if a Twitch username was provided
        if (!args.length) {
            return message.channel.send("Please provide your Twitch username.");
        }

        const twitchUsername = args[0];
        const userId = message.author.id; // User ID of the person running the command
        const filePath = path.join(__dirname, '../../../naughty_users.json'); // Adjust path if needed

        // Read and parse the JSON file
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading the JSON file:', err);
                return message.channel.send("There was an error reading the data file.");
            }

            let jsonData = {};
            try {
                jsonData = JSON.parse(data);
            } catch (parseError) {
                console.error('Error parsing JSON data:', parseError);
                return message.channel.send("There was an error parsing the data file.");
            }

            // Find the guild data or initialize if not exists
            const guildId = message.guild.id;
            if (!jsonData[guildId]) {
                jsonData[guildId] = { users: [] };
            }

            // Find the user in the users array
            const users = jsonData[guildId].users;
            let user = users.find(u => u.userId === userId);

            if (user && user.twitchname === twitchUsername) {
                // User's Twitch username is already set to the same value
                return message.channel.send(`Your Discord account is already linked with "${twitchUsername}".`);
            }

            if (!user) {
                // If user doesn't exist, create a new entry
                user = {
                    userId: userId,
                    twitchname: twitchUsername
                };
                users.push(user);
            } else {
                // If user exists, update their Twitch username
                user.twitchname = twitchUsername;
            }

            // Write the updated JSON back to the file
            fs.writeFile(filePath, JSON.stringify(jsonData, null, 4), 'utf8', (writeErr) => {
                if (writeErr) {
                    console.error('Error writing to the JSON file:', writeErr);
                    return message.channel.send("There was an error saving your Twitch username.");
                }

                // Success message
                const embed = new MessageEmbed()
                    .setTitle("Twitch Linked to Discord")
                    .setDescription(`Your Twitch account (${twitchUsername}) has been linked to ${message.author.username}`)
                    .setColor("GREEN");
                message.channel.send({ embeds: [embed] });
            });
        });
    }
};
