const Command = require("../../structures/Command");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
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

    async run(message) {
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

        // Pagination logic
        const perPage = 10;
        let page = 1;
        
        const displayLeaderboard = async (page, prevMessage) => {
            const startIndex = (page - 1) * perPage;
            const endIndex = startIndex + perPage;

            // Slice the users array based on pagination
            const usersOnPage = users.slice(startIndex, endIndex);

            // Create a leaderboard message
            let leaderboardMessage = `**Top ${perPage} - Page ${page}**\n\n`;
            if (usersOnPage.length === 0) {
                leaderboardMessage += "No users to display on this page.";
            } else {
                usersOnPage.forEach((user, index) => {
                    leaderboardMessage += `**${startIndex + index + 1}.** ${user.username} - ${user.counter} times\n`;
                });
            }

            const embed = new MessageEmbed()
                .setTitle('**Special Naughty Achievement Leaderboard**')
                .setDescription(leaderboardMessage)
                .setColor('#FFD700') // Gold color for leaderboard
                .setTimestamp();

            // Create buttons for navigation
            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('prev_page')
                        .setLabel('Previous')
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('next_page')
                        .setLabel('Next')
                        .setStyle('PRIMARY'),
                );

            // Update the existing message with the new leaderboard content
            if (prevMessage) {
                await prevMessage.edit({ embeds: [embed], components: [row] }).catch(console.error);
            } else {
                const reply = await message.channel.send({ embeds: [embed], components: [row] });

                const filter = (interaction) => interaction.user.id === message.author.id;
                const collector = reply.createMessageComponentCollector({ filter, time: 60000 });

                collector.on('collect', async (interaction) => {
                    await interaction.deferUpdate();
                    if (interaction.customId === 'prev_page' && page > 1) {
                        page--;
                        await displayLeaderboard(page, reply);
                    } else if (interaction.customId === 'next_page' && endIndex < users.length) {
                        page++;
                        await displayLeaderboard(page, reply);
                    }
                });

                collector.on('end', () => {
                    reply.edit({ components: [] }).catch(console.error);
                });
            }
        };

        // Display initial leaderboard
        await displayLeaderboard(page);
    }
};

