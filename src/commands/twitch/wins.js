const Command = require("../../structures/Command");

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: "- wins -",
            description: "Displays the current wins counter",
            category: "twitch",
            guildOnly: true,
            ownerOnly: true,
            cooldown: 3,
        });
    }
};
