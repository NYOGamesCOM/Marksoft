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
        const page = parseInt(args[0]) || 1;
    
        if (isNaN(page) || page < 1 || page > totalPages) {
            return message.channel.send(`Invalid page number. Please enter a number between 1 and ${totalPages}.`);
        }
    
        // Calculate the starting and ending indices for the current page
        const startIndex = (page - 1) * USERS_PER_PAGE;
        const endIndex = Math.min(startIndex + USERS_PER_PAGE, guildUsers.length);
    
        // Generate the leaderboard message for the current page
        let leaderboardMessage = `**Page ${page}/${totalPages}**\n\n`;
        if (guildUsers.length === 0) {
            leaderboardMessage += "No one has hit the magic number 69 yet!";
        } else {
            for (let i = startIndex; i < endIndex; i++) {
                const user = guildUsers[i];
                leaderboardMessage += `\`${i + 1}.\` **${user.username}** - \`${user.counter} times\`\n`;
                //leaderboardMessage += `\`${i + 1}.\` **${user.username.padEnd(20)}** - \`${user.counter.toString().padStart(5)} times\`\n`;


                /*.addField("Left", `${oldChannelName}`, true)
                .addField("Joined", `${newChannelName}`, true)*/
            }
        }
    
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
    
            // Collect button interactions
            const filter = i => i.user.id === message.author.id && (i.customId === 'previousPage' || i.customId === 'nextPage');
            const collector = msg.createMessageComponentCollector({ filter, time: 60000 });
    
            collector.on('collect', async interaction => {
                if (interaction.customId === 'previousPage') {
                    if (page > 1) {
                        this.run(message, [page - 1]);
                    }
                } else if (interaction.customId === 'nextPage') {
                    if (page < totalPages) {
                        this.run(message, [page + 1]);
                    }
                }
    
                await interaction.deferUpdate();
                collector.stop();
            });
    
            collector.on('end', () => {
                msg.edit({ components: [] });
            });
        } else {
            await message.channel.send({ embeds: [embed] });
        }
    }
}