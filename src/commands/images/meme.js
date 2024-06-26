/* MADE FOR BANKAI COMMUNITY */

const Command = require("../../structures/Command");
const Discord = require("discord.js");
const got = require("got");
const { incrementCommandCounter } = require("../../utils/utils.js");
module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "meme",
      description: "Generate some memes from reddit!",
      category: "images",
      cooldown: 5,
    });
  }

  async run(message) {
    try {
      const embed = new Discord.MessageEmbed();
      got("https://www.reddit.com/r/memes/random/.json").then((response) => {
        let content = JSON.parse(response.body);
        let permalink = content[0].data.children[0].data.permalink;
        let memeUrl = `https://reddit.com${permalink}`;
        let memeImage = content[0].data.children[0].data.url;
        let memeTitle = content[0].data.children[0].data.title;
        let memeUpvotes = content[0].data.children[0].data.ups;
        let memeNumComments = content[0].data.children[0].data.num_comments;
        embed.setTitle(`${memeTitle}`);
        embed.setURL(`${memeUrl}`);
        embed.setColor("RANDOM");
        embed.setImage(memeImage);
        embed.setFooter({ text: `👍 ${memeUpvotes} 💬 ${memeNumComments}` });
        message.channel.sendCustom({ embeds: [embed] });
      });
    } catch (error) {
      this.client.emit("apiError", error, message);
    }
  }
};