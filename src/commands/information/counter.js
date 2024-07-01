const { loadCommandCounter } = require("../../utils/utils.js");
const Command = require("../../structures/Command.js");
const { MessageEmbed } = require("discord.js");
const path = require("path");

const jsonFilePath = path.join(__dirname, '..', '..', 'assets', 'json', 'command_counter.json');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: "counter",
            description: "Display the usage counter of a specific command",
            category: "Information",
            guildOnly: true,
            ownerOnly: true,
            cooldown: 3,
            args: true,
            usage: "<commandName>",
        });
    }

    async run(message, args) {
        const commandCounter = loadCommandCounter(jsonFilePath); 

        if (!args.length) {
            return message.reply("Please specify a command name to view its usage counter.");
        }

        const commandName = args[0].toLowerCase();

        if (!commandCounter || !commandCounter[commandName]) {
            return message.reply(`Command \`${commandName}\` has not been used yet.`);
        }
        const formattedCount = commandCounter[commandName].toLocaleString();
        const embed = new MessageEmbed()
            .setColor("#ffcc00") // Gold color
            .setTitle(`Command Usage Counter: ${commandName}`)
            .setDescription(`\`This command has been used ${formattedCount} time(s).\``)
            .addFields(
                { name: "Command Name", value: `\`${commandName}\``, inline: true },
                { name: "Usage Count", value: `\`${formattedCount}\``, inline: true }
            )
            .setFooter(`Requested by ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });
    }
};
