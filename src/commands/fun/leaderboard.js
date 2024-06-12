/* MADE FOR BANKAI COMMUNITY */

const Command = require("../../structures/Command");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const fs = require('fs');
const path = require('path');

const USERS_PER_PAGE = 10;

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
        let data = {};
        let guildUsers = [];
    
        // Read existing data from the file
        try {
            if (fs.existsSync(filePath)) {
                const fileData = fs.readFileSync(filePath, 'utf8');
                data = JSON.parse(fileData);
                guildUsers = data[message.guild.id]?.users || [];
            }
        } catch (err) {
            console.error('Error reading the JSON file:', err);
            return message.channel.send('There was an error reading the leaderboard data.');
        }
    
        // Sort users by the counter in descending order
        if (Array.isArray(guildUsers)) {
            guildUsers.sort((a, b) => b.counter - a.counter);
        } else {
            // Transform guildUsers into an array of user objects
            guildUsers = Object.values(guildUsers);
            guildUsers.sort((a, b) => b.counter - a.counter);
        }
    
        // Calculate the number of pages needed
        const totalPages = Math.ceil(guildUsers.length / USERS_PER_PAGE);
    
        // Parse page number from the command argument
        let page = parseInt(args[0]) || 1;
    
        if (isNaN(page) || page < 1 || page > totalPages) {
            return message.channel.send(`Invalid page number. Please enter a number between 1 and ${totalPages}.`);
        }
    
        // Calculate the starting and ending indices for the current page
        const startIndex = (page - 1) * USERS_PER_PAGE;
        const endIndex = Math.min(startIndex + USERS_PER_PAGE, guildUsers.length);
    
        // Generate the leaderboard message for the current page
        let leaderboardMessage = `**Page ${page}/${totalPages}**\n\n\`\`\`\n`;
        leaderboardMessage += `No.  | Username            | Total 69s\n`;
        leaderboardMessage += `-----|---------------------|----------\n`;
        if (guildUsers.length === 0) {
            leaderboardMessage += "No one has hit the magic number 69 yet!";
        } else {
            for (let i = startIndex; i < endIndex; i++) {
                const user = guildUsers[i];
                leaderboardMessage += `${(i + 1).toString().padEnd(5, ' ')}| ${user.username.padEnd(20, ' ')}| ${user.counter.toString().padEnd(5, ' ')}\n`;
            }
        }

        leaderboardMessage += `\`\`\``;
    
        const embed = new MessageEmbed()
            .setTitle('Special Naughty Achievement Leaderboard')
            .setDescription(leaderboardMessage)
            .setColor('#FFD700') // Gold color for leaderboard
            .setTimestamp();
    
        // Add pagination buttons if there are multiple pages
        if (totalPages > 1) {
            const previousButton = new MessageButton()
                .setCustomId('previousPage')
                .setLabel('Previous')
                .setStyle('PRIMARY');
    
            const nextButton = new MessageButton()
                .setCustomId('nextPage')
                .setLabel('Next')
                .setStyle('PRIMARY');
    
            const row = new MessageActionRow()
                .addComponents(previousButton, nextButton);
    
            const msg = await message.channel.send({ embeds: [embed], components: [row] });
    
            const filter = i => i.user.id === message.author.id && (i.customId === 'previousPage' || i.customId === 'nextPage');
            const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async interaction => {
                if (interaction.customId === 'previousPage' && page > 1) {
                    page--;
                } else if (interaction.customId === 'nextPage' && page < totalPages) {
                    page++;
                } else {
                    return interaction.deferUpdate();
                }

                // Calculate the new starting and ending indices for the current page
                const newStartIndex = (page - 1) * USERS_PER_PAGE;
                const newEndIndex = Math.min(newStartIndex + USERS_PER_PAGE, guildUsers.length);

                // Generate the updated leaderboard message for the current page
                let newLeaderboardMessage = `**Page ${page}/${totalPages}**\n\n\`\`\`\n`;
                newLeaderboardMessage += `No.  | Username            | Total 69s\n`;
                newLeaderboardMessage += `-----|---------------------|----------\n`;
                //leaderboardMessage += `No.  | Username             | Usage | Total 69s\n`;
                //leaderboardMessage += `-----|----------------------|-------|----------\n`;
                if (guildUsers.length === 0) {
                    newLeaderboardMessage += "No one has hit the magic number 69 yet!";
                } else {
                    for (let i = newStartIndex; i < newEndIndex; i++) {
                        const user = guildUsers[i];
                        newLeaderboardMessage += `${(i + 1).toString().padEnd(5, ' ')}| ${user.username.padEnd(20, ' ')}| ${user.counter.toString().padEnd(5, ' ')}\n`;
                        //leaderboardMessage += `${(i + 1).toString().padEnd(5, ' ')}| ${user.username.padEnd(20, ' ')}| ${user.usage.toString().padEnd(7, ' ')}| ${user.counter.toString().padEnd(5, ' ')}\n`;
                    }
                }

                newLeaderboardMessage += `\`\`\``;

                const newEmbed = new MessageEmbed()
                    .setTitle('Special Naughty Achievement Leaderboard')
                    .setDescription(newLeaderboardMessage)
                    .setColor('#FFD700') // Gold color for leaderboard
                    .setTimestamp();
                
                // Edit the existing message with the updated embed
                interaction.message.edit({ embeds: [newEmbed], components: [row] });

                await interaction.deferUpdate();
            });
    
            collector.on('end', () => {
                msg.edit({ components: [] });
            });
        } else {
            await message.channel.send({ embeds: [embed] });
        }
    }
}
