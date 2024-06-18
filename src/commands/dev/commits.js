const Command = require("../../structures/Command");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const axios = require("axios");
const config = require("../../../config.json");

module.exports = class CommitsCommand extends Command {
  constructor(...args) {
    super(...args, {
      name: "commits",
      aliases: [],
      description: "This is for the developers.",
      category: "dev",
      cooldown: 5,
      ownerOnly: true,
    });
  }

  async run(message) {
    if (!config.developers.includes(message.author.id)) {
      return message.channel.send("Sorry but this is a developer command only!");
    }
    try {
      const getCommits = async () => {
        try {
          const response = await axios.get(
            "https://api.github.com/repos/NYOGamesCOM/Marksoft/commits"
          );
          const commits = response.data.slice(0, 10); // Limit to the latest 25 commits
          console.log(`Total commits: ${commits.length}`);

          const embed = new MessageEmbed()
            .setTitle("Commits")
            .setColor("#FF5733");

          commits.forEach(commit => {
            embed.addField(
              commit.commit.author.name,
              `**Message:** ${commit.commit.message}\n` +
              `**Date:** ${new Date(commit.commit.author.date).toDateString()}\n` +
              `**URL:** [View Commit](${commit.html_url})`
            );
          });

          const row = new MessageActionRow().addComponents(
            new MessageButton()
              .setCustomId("test")
              .setLabel("View More Commits")
              .setStyle("PRIMARY")
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
                content: "View more commits on GitHub:",
                embeds: [],
                components: [],
                allowedMentions: { repliedUser: false },
                components: [],
                embeds: [
                  new MessageEmbed()
                    .setDescription(`[View All Commits on GitHub](https://github.com/NYOGamesCOM/Marksoft/commits)`)
                ]
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
      console.error("Error in the commits command:", error);
      message.channel.send("An error occurred. Please try again later.");
    }
  }
};
