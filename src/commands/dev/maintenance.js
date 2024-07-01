const Command = require("../../structures/Command");
const Maintenance = require("../../database/schemas/maintenance");
const config = require("../../../config.json");
const { incrementCommandCounter } = require("../../utils/utils.js");
module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "maintenance",
      aliases: ["maintenance"],
      description: "This is for the developers.",
      category: "dev",
      ownerOnly: true,
    });
  }

  async run(message, args) {
    if (!config.developers.includes(message.author.id)) {
      return message.channel.send("Sorry but this is a developer command only!");
    }
    if (!args[0])
      return message.channel.sendCustom(
        "Would you like to enable or disable maintenance mode?"
      );

    const maintenance = await Maintenance.findOne({
      maintenance: "maintenance",
    });

    if (args[0].toLowerCase() == "enable") {
      if (maintenance) {
        maintenance.toggle = "true";
        await maintenance.save();
      } else {
        const newMain = new Maintenance({
          toggle: "true",
        });
        newMain.save().catch(() => {});
      }
      message.channel.sendCustom("Enabled maintenance mode");
    } else if (args[0].toLowerCase() == "disable") {
      if (maintenance) {
        maintenance.toggle = "false";
        await maintenance.save();
      } else {
        const newMain = new Maintenance({
          toggle: "false",
        });
        newMain.save().catch(() => {});
      }
      message.channel.sendCustom("Disabled maintenance Mode");
    } else {
      message.channel.sendCustom("Invalid Response");
    }
  }
};
