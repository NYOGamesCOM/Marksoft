const Command = require("../../structures/Command");
const fs = require('fs');
const path = require('path');
const { MessageEmbed } = require("discord.js");
const { incrementCommandCounter } = require("../../utils/utils.js");
// Adjust the path to stores.json
const filePath = path.join(__dirname, '..', '..', 'assets', 'json', 'stores.json');

// Wrap the file reading and parsing in a try-catch block
let storesData;
try {
    const fileData = fs.readFileSync(filePath, 'utf8');
    storesData = JSON.parse(fileData);
} catch (error) {
    console.error('Error reading or parsing stores.json:', error);
    // Handle the error appropriately (e.g., throw an error, return early, etc.)
    // For simplicity, we'll log the error and exit the script in case of failure.
    process.exit(1); // Exit with an error status
}

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: "store",
            aliases: ["magazin", "profi"],
            description: "Displays information about a Profi store",
            category: "Information",
            usage: "store ID",
            guildOnly: true,
        });
        this.allowedChannelID = '1045732570148651170';
    }

    async run(message, args) {
        const storeID = parseInt(args[0]);
        if (isNaN(storeID)) return message.reply('Please provide a valid store ID.');

        if (message.channel.id !== this.allowedChannelID) {
            return message.reply(`This command can only be used in <#${this.allowedChannelID}>.`);
        }

        const store = storesData.stores.find(store => store.storeID === storeID);
        if (!store) return message.reply('Store ID not found.');

        const mapsLink = `https://www.google.com/maps?q=${encodeURIComponent(store.address)}`;

        const embed = new MessageEmbed()
            .setAuthor(`${store.description}`)
            .setTitle(` :notebook_with_decorative_cover: Detalii magazin ${store.storeID}`)
            .setDescription(`**• Sef Magazin:** \`${store.store_manager}\` | **• Marca:** \`${store.store_manager_ID}\` \n
            **• Sef zona:** \`${store.ASD}\` | **• Marca:** \`${store.asd_ID}\` \n
            **• Sef regiune:** \`${store.RD}\` | **• Marca:** \`${store.RD_ID}\` \n
            **• Responsabil HR:** \`${store.HR}\` \n
            **• Director de format:** \`${store.format_director}\` \n
            **• Responsabil de securitate:** \`${store.security_resp}\` \n
            **• Oras:** \`${store.city}\` | \`${store.county}\` \n
            **• Adresa:** \`${store.address}\`  [ :map: ](${mapsLink}) \n
            **• Contact:** \`${store.contact_1}\` | \`${store.contact_2}\` | \`${store.Email}\` \n
            **• Data deschiderii:** \`${store.opening_date}\` | **• NONSTOP :** \`${store.non_stop}\` \n
            **• Numar case de marcat:** \`${store.checkouts}\` | **• Touchscreen:** \`${store.touchscreen}\` \n
            **• Partener:** \`${store.partnet}\` | **• Data preluare:** \`${store.partner_date}\` \n
            **• Buget Angajati:** \`${store.employee_budget}\` | **• Numar Angajati:** \`${store.employees}\` | **• Payroll:** \`${store.payroll}\` \n
            **• Orar L-V:** \`${store.schedule}\` | **• Orar S:** \`${store.schedule_saturday}\` | | **• Orar D:** \`${store.schedule_sunday}\` \n
            **• Tip:** \`${store.Tip}\` | **• Subtip:** \`${store.Subtip}\` | **• Concept:** \`${store.Concept}\` \n
            **• Suprafata totala:** \`${store.area}\` | **• Suprafata Vanzare:** \`${store.area_store}\` \n
            **• Centru mentorat:** \`${store.mentoring}\` | **• Stivuitor:** \`${store.forklift}\` | OP: \`${store.forklift_op}\`\n
            **• Solutie CCTV:** \`${store.CCTV}\` | **• Furnizor CCTV:** \`${store.CCTV_maintenance}\` \n
            **• IP DVR:** \`${store.DVR_IP}\` \n
            **• Furnizor sistem antiefractie:** \`${store.security_sec}\` \n
            **• Furnizor sistem detectie incendiu:** \`${store.security_safety}\` \n
            **• Sectiune speciala:** \`${store.special_section}\` \n
            `);

        embed.setFooter({
            text: `Requested by ${message.author.username}`,
            iconURL: message.author.displayAvatarURL({ dynamic: true }),
        });

        embed.setTimestamp();
        embed.setThumbnail(message.guild.iconURL());
        embed.setColor(message.guild.me.displayHexColor);

        message.channel.send({ embeds: [embed] });
    }
};
