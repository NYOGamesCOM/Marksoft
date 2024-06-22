const Command = require("../../structures/Command");

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: "- setachievementchannel -",
            description: "Set where the 69 achievement goes to",
            usage: "!setachievementchannel [discord channel id]",
            category: "twitch",
            guildOnly: true,
            ownerOnly: true,
            cooldown: 3,
        });
    }
};
