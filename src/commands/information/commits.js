const Command = require("../../structures/Command");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const axios = require("axios");

module.exports = class EmptyCommand extends Command {
  constructor(...args) {
    super(...args, {
      name: "commits",
      aliases: [],
      description: "Display github commits",
      category: "General",
      cooldown: 5,
    });
  }

  async run(message) {
    try {
      const getCommits = async () => {
        try {
          const response = await axios.get(
            "https://api.github.com/repos/NYOGamesCOM/Marksoft/commits"
          );
          const commits = response.data;
          console.log(`Total commits: ${commits.length}`);

          const embed = new MessageEmbed()
            .setTitle("Commits")
            .setDescription(`Commit message: ${commits[0].commit.message}`)
            .addField("Commit Author", commits[0].commit.author.name)
            .setColor("#FF5733");

          const row = new MessageActionRow().addComponents(
            new MessageButton()
              .setCustomId("test")
              .setLabel("Testing")
              .setStyle("SUCCESS")
          );

          const sentMessage = await message.channel.send({
            embeds: [embed],
            components: [row],
          });

          const collector = sentMessage.createMessageComponentCollector({
            time: 15000,
          });

          collector.on("collect", async (i) => {
            if (i.customId === "test") {
              await i.deferUpdate();
              await i.editReply({
                content: `Total commits: ${commits.length}`,
                embeds: [],
                components: [],
              });
            }
          });

          collector.on("end", (collected) => {
            if (collected.size === 0) {
              sentMessage.edit({ components: [] });
            }
          });
        } catch (error) {
          console.error(`Error: ${error}`);
        }
      };

      getCommits();
    } catch (error) {
      console.error("Error in the empty command:", error);
      message.channel.send("An error occurred. Please try again later.");
    }
  }
};
