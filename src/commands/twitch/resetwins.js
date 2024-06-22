const Command = require("../../structures/Command");

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: "- resetwins -",
            description: "Resets the counter to 0.",
            category: "twitch",
            guildOnly: true,
            ownerOnly: true,
            cooldown: 3,
        });
    }
};
