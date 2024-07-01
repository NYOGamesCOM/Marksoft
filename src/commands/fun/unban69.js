/* eslint-disable no-useless-escape */
const Command = require("../../structures/Command");
const fs = require("fs");
const path = require("path");
const { incrementCommandCounter } = require("../../utils/utils.js");
module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: "unban69",
            description: "Unban a user from using the naughty command.",
            category: "moderation",
            usage: "<user>",
            guildOnly: true,
            cooldown: 3,
            userPermissions: ["ADMINISTRATOR"], // Required permissions to use this command
        });
    }

    async run(message, args) {
        if (!args[0]) {
            return message.reply('Please mention a user or provide their ID.');
        }

        // Get the user to unban
        let userToUnban;
        if (message.mentions.users.size) {
            userToUnban = message.mentions.users.first();
        } else {
            userToUnban = await message.guild.members.fetch(args[0]).catch(() => null);
            if (userToUnban) userToUnban = userToUnban.user;
        }

        if (!userToUnban) {
            return message.reply('Could not find that user.');
        }

        const userId = userToUnban.id;
        const filePath = path.join(__dirname, '..', '..', '..', 'src', 'assets', 'json', 'banned_users.json');


        // Read existing banned users
        let bannedUsers = [];
        try {
            if (fs.existsSync(filePath)) {
                const fileData = fs.readFileSync(filePath, 'utf8');
                bannedUsers = JSON.parse(fileData);
            }
        } catch (err) {
            console.error('Error reading the JSON file:', err);
            return message.reply('There was an error reading the ban list.');
        }

        // Remove user from ban list if present
        if (bannedUsers.includes(userId)) {
            bannedUsers = bannedUsers.filter(id => id !== userId);
            try {
                fs.writeFileSync(filePath, JSON.stringify(bannedUsers, null, 2), 'utf8');
                console.log('User removed from banned_users.json');
                return message.reply(`${userToUnban.tag} has been unbanned from using the naughty command.`);
            } catch (err) {
                console.error('Error writing to the JSON file:', err);
                return message.reply('There was an error updating the ban list.');
            }
        } else {
            return message.reply(`${userToUnban.tag} is not currently banned.`);
        }
    }
};
