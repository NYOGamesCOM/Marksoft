const Command = require("../../structures/Command");
const { createCanvas, loadImage } = require("canvas");
const { MessageAttachment, MessageEmbed } = require("discord.js");
const userData = require("../../data/users.json");
const guildData = require("../../data/users.json");

// Calculate the required XP for a certain level
function calculateRequiredXP(level) {
  const baseXP = 75;
  const increment = level * 75;
  const xpNeeded = level * increment;
  if (level === 0) {
    return baseXP + xpNeeded;
  } else {
    return xpNeeded;
  }
}

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "rank",
      description: "Display your rank card.",
      category: "Leveling",
      cooldown: 5,
      guildOnly: true,
    });
  }

  async run(message) {
    try {
      const targetUser = message.mentions.users.first() || message.author;
      const guild = message.guild;
      const user = userData.guilds[guild.id]?.users[targetUser.id];

      if (
        guildData.guilds[guild.id] &&
        guildData.guilds[guild.id].levelingEnabled === false
      ) {
        return message.reply("Leveling is disabled for this server.");
      }

      if (!user) {
        return message.reply("User not found.");
      }

      const canvas = createCanvas(900, 300);
      const ctx = canvas.getContext("2d");

      // Load background (Replace 'default_background_url.jpg' with your default background URL)
      const backgroundURL =
        user.background ||
        "https://i.imgur.com/xymSRRO.png";
      const background = await loadImage(backgroundURL);
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      // Draw user details
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 36px Arial";
      ctx.textAlign = "left";
      ctx.fillText(targetUser.username, 200, 100);

      // Avatar
      const avatar = await loadImage(
        targetUser.displayAvatarURL({ format: "png", size: 128 }),
      );
      ctx.drawImage(avatar, 50, 50, 140, 150);

      ctx.font = "bold 48px Arial";
      const levelText = `Level ${user.level}`;
      ctx.fillText(levelText, 670, 100);

      const requiredXPForCurrentLevel = calculateRequiredXP(user.level - 1);
      const requiredXPForNextLevel = calculateRequiredXP(user.level);
      const progressBarWidth = 600;
      const progressWidth =
        ((user.xp - requiredXPForCurrentLevel) /
          (requiredXPForNextLevel - requiredXPForCurrentLevel)) *
        progressBarWidth;

      // XP details
      ctx.font = "24px Arial";
      ctx.fillText(`Current XP: ${user.xp}`, 200, 150);
      ctx.fillText(
        `XP till Level Up: ${requiredXPForNextLevel - user.xp}`,
        200,
        200,
      );

      ctx.font = "24px Arial";
      ctx.fillText(`Total XP: ${user.xp}/${requiredXPForNextLevel}`, 250, 250);

      // Rounded progress bar
      ctx.roundRect = function (x, y, width, height, radius, fill, stroke) {
        this.beginPath();
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(
          x + width,
          y + height,
          x + width - radius,
          y + height,
        );
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
        stroke && this.stroke();
        fill && this.fill();
      };

      ctx.save();
      ctx.roundRect(200, 250, progressWidth, 15, 7, true, false);

      const attachment = new MessageAttachment(canvas.toBuffer(), "rank.png");
      message.channel.send({ files: [attachment] });
    } catch (error) {
      console.error("Error occurred:", error);
      message.reply("An error occurred while generating the rank card.");
    }
  }
};