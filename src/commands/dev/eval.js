const Command = require("../../structures/Command");
const config = require("../../config.json");
module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "eval",
      aliases: ["ev"],
      description: "This is for the developers.",
      category: "dev",
      usage: ["<thing-to-eval>"],
      ownerOnly: true,
    });
  }

  async run(message, args) {
    if (!config.developers.includes(message.author.id)) {
      return message.channel.send("Sorry but this is a developer command only!");
    }
    const input = args.join(" ");
    if (!input) return message.channel.sendCustom(`What do I evaluate?`);
    if (!input.toLowerCase().includes("token")) {
      let embed = ``;

      try {
        let output = eval(input);
        if (typeof output !== "string")
          output = require("util").inspect(output, { depth: 0 });

        embed = `\`\`\`js\n${
          output.length > 1024 ? "Too large to display." : output
        }\`\`\``;
      } catch (err) {
        embed = `\`\`\`js\n${
          err.length > 1024 ? "Too large to display." : err
        }\`\`\``;
      }

      message.channel.sendCustom(embed);
    } else {
      message.channel.sendCustom("Bruh you tryina steal my token huh?");
    }
  }
};
