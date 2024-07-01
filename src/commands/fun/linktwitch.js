const Command = require("../../structures/Command");
const path = require("path");
const fs = require("fs");
const { incrementCommandCounter } = require("../../utils/utils.js");
module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: "link",
            aliases: ["linktwitch", "setTwitch"],
            description: "Link your Twitch username to your Discord account.",
            category: "fun",
            usage: "<twitch_username>",
            guildOnly: true,
            cooldown: 5,
        });
    }

    async run(message) {
        const args = message.content.split(' ').slice(1); // Get command arguments
        const twitchUsername = args.join(' ').trim();

        if (!twitchUsername) {
            return message.reply("Please provide a Twitch username to link.");
        }

        try {
            const isAlreadyLinked = checkIfTwitchUsernameExists(message, twitchUsername);

            if (isAlreadyLinked) {
                return message.reply(`Your Twitch username **${twitchUsername}** has already been linked.`);
            }

            updateTwitchUsername(message, twitchUsername);

            return message.reply(`Your Twitch username **${twitchUsername}** has been successfully linked with discord!`);
        } catch (error) {
            console.error('Error linking Twitch username:', error);
            return message.reply('There was an error linking your Twitch username. Please try again later.');
        }
    }
};

// Utility function to check if the Twitch username is already linked
function checkIfTwitchUsernameExists(message, twitchUsername) {
    const filePath = path.join(__dirname, '..', '..', '..', 'src', 'assets', 'json', 'naughty_users.json');
    let data = {};

    // Read existing data from JSON file
    try {
        if (fs.existsSync(filePath)) {
            const fileData = fs.readFileSync(filePath, 'utf8');
            data = JSON.parse(fileData);
        }
    } catch (err) {
        console.error('Error reading the JSON file:', err);
        throw err; // Rethrow to handle it in the command
    }

    // Extract guild ID
    const guildId = message.guild.id;

    // Initialize guild data if not present
    if (!data[guildId]) {
        data[guildId] = { webhook: "", users: [] };
    }

    const guildData = data[guildId];
    let guildUsers = guildData.users;

    // Check if the provided Twitch username already exists for any user
    const isAlreadyLinked = guildUsers.some(user => user.userId === message.author.id && user.twitch === twitchUsername);

    return isAlreadyLinked;
}

// Utility function to update the Twitch username in the JSON file
function updateTwitchUsername(message, twitchUsername) {
    const filePath = path.join(__dirname, '..', '..', '..', 'src', 'assets', 'json', 'naughty_users.json');

    let data = {};

    // Read existing data from JSON file
    try {
        if (fs.existsSync(filePath)) {
            const fileData = fs.readFileSync(filePath, 'utf8');
            data = JSON.parse(fileData);
        }
    } catch (err) {
        console.error('Error reading the JSON file:', err);
        throw err; // Rethrow to handle it in the command
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
        user.twitch = twitchUsername;
    } else {
        user = {
            username: message.author.username,
            userId: userId,
            counter: 0, // Default counter if user doesn't exist
            date: new Date().toISOString(),
            twitch: twitchUsername
        };
        guildUsers.push(user);
    }

    // Save updated data back to JSON file
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log('User data updated with twitch username in naughty_users.json');
    } catch (err) {
        console.error('Error writing to the JSON file:', err);
        throw err; // Rethrow to handle it in the command
    }
}
