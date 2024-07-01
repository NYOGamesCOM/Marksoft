/* MADE FOR BANKAI COMMUNITY */

const Command = require("../../structures/Command");
const path = require('path');
const fs = require("node:fs");
const { incrementCommandCounter } = require("../../utils/utils.js");
module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: "setnaughtywebhook",
            description: "Sets the naughty webhook URL for the current guild.",
            category: "config",
            usage: "<webhook_url>",
            guildOnly: true,
            userPermissions: ["ADMINISTRATOR"], // Only administrators can use this command
        });
    }

    async run(message, args) {
        // Ensure a webhook URL is provided
        if (args.length === 0) {
            return message.reply("Please provide a webhook URL.");
        }

        const webhookUrl = args[0];

        // Basic validation of the webhook URL
        if (!webhookUrl.startsWith("https://discord.com/api/webhooks/")) {
            return message.reply("Please provide a valid Discord webhook URL.");
        }

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
            return message.reply("An error occurred while reading the data file.");
        }

        // Ensure data structure exists for the current guild
        if (!data[message.guild.id]) {
            data[message.guild.id] = { webhook: "", users: [] };
        }

        // Update the webhook URL
        data[message.guild.id].webhook = webhookUrl;

        // Write updated data back to the file
        try {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
            console.log('Webhook URL updated in naughty_users.json');
            message.reply("Webhook URL has been updated successfully!");
        } catch (err) {
            console.error('Error writing to the JSON file:', err);
            message.reply("An error occurred while writing to the data file.");
        }
    }
};
