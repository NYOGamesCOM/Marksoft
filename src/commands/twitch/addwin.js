const Command = require("../../structures/Command");

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: "- addwin -",
            description: "Adds +1 to the counter.",
            category: "twitch",
            guildOnly: true,
            ownerOnly: true,
            cooldown: 3,
        });
    }
};
