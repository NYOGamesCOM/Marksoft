const Command = require("../../structures/Command");
const axios = require('axios');
const { MessageEmbed } = require("discord.js");

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: "flea",
            aliases: ["tarkovprice"],
            description: "Price information for an item from the EFT",
            category: "Information",
            usage: "flea <item name>",
            guildOnly: true,
        });

        // Specify the allowed channel ID
        this.allowedChannelID = '1045732570148651170';
    }

    async run(message, args) {
        const query = args.join(' ');
        if (!query) return message.reply('Please provide an item to search for.');

        // Construct the API URL
        const apiUrl = `https://api.tarkov-market.app/api/v1/nightbot?x-api-key=Q3hWfaNvVw0btOmk&q=${encodeURIComponent(query)}`;

        try {
            // Make the API request
            const response = await axios.get(apiUrl);

            // Check if the response is successful
            if (response.status === 200) {
                const embed = new MessageEmbed()
                    .setTitle(`Flea market price for: \`${query}\``)
                    .setDescription(response.data)
                    .setColor('#0099ff')
                    .setFooter({
                        text: `Requested by ${message.author.username}`,
                        iconURL: message.author.displayAvatarURL({ dynamic: true }),
                    })
                    .setTimestamp();

                message.channel.send({ embeds: [embed] });
            } else {
                message.reply('Failed to fetch price information.');
            }
        } catch (error) {
            console.error(error);
            message.reply('An error occurred while fetching price information.');
        }
    }
};
