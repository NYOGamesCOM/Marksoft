const Command = require("../../structures/Command");

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: "- setlivechannel -",
            description: "Set where the live notification goes to",
            usage: "!setlivechannel [discord channel id]",
            category: "twitch",
            guildOnly: true,
            ownerOnly: true,
            cooldown: 3,
        });
    }
};
