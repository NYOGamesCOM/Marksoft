const Command = require("../../structures/Command");
const NewsSchema = require("../../database/schemas/Marksoft");
const config = require("../../config.json");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "setnews",
      description: "This is for the developers.",
      category: "dev",
      usage: ["<text>"],
      ownerOnly: true,
    });
  }

  async run(message, args) {
    if (!config.developers.includes(message.author.id)) {
      return message.channel.send("Sorry but this is a developer command only!");
    }
    let news = args.join(" ").split("").join("");
    if (!news) return message.channel.send("Please enter news.");
    const newsDB = await NewsSchema.findOne({});
    if (!newsDB) {
      await NewsSchema.create({
        news: news,
        time: new Date(),
      });

      return message.channel.send("News set.");
    }

    await NewsSchema.findOneAndUpdate(
      {},
      {
        news: news,
        time: new Date(),
      }
    );
  }
};
