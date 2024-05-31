require("dotenv").config();
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const MarksoftClient = require("./Marksoft");
const config = require("./config.json");
const deploy = require("./src/deployCommands.js");
const path = require("node:path");
const { Collection } = require("discord.js");
const logger = require("./src/utils/logger");
const fs = require("node:fs");
const Marksoft = new MarksoftClient(config);
let messageCreateEventFired = false;

const color = require("./src/data/colors");
Marksoft.color = color;

const emoji = require("./src/data/emoji");
Marksoft.emoji = emoji;

let client = Marksoft;
const jointocreate = require("./src/structures/jointocreate");
jointocreate(client);

const userData = require("./src/data/users.json");

client.on("messageCreate", async (message) => {
  if (message.author.bot) {
    return;
  }

  const guildId = message.guild?.id;

  if (!guildId) {
    console.error("Guild ID is undefined");
    return;
  }

  const guildConfig = getGuildConfig(guildId);
  const userId = message.author.id;

  // Load user data from file
  const userDataPath = "./src/data/users.json";
  let userData = {};
  try {
    const userDataFileContent = fs.readFileSync(userDataPath, "utf-8");
    userData = JSON.parse(userDataFileContent);
  } catch (error) {
    console.error("Error reading user data file:", error);
  }

  // Ensure userData.guilds is defined
  if (!userData.guilds) {
    userData.guilds = {};
  }

  // Ensure userData.guilds[guildId] is defined
  if (!userData.guilds[guildId]) {
    userData.guilds[guildId] = {
      users: {},
      levelingEnabled: true,
    };
  }

  // Ensure userData.guilds[guildId].users[userId] is defined
  if (!userData.guilds[guildId].users[userId]) {
    userData.guilds[guildId].users[userId] = {
      xp: 0,
      level: 1,
      messageTimeout: Date.now(),
      username: message.author.username,
    };
  }

      if (!userData.guilds[guildId].users[userId].background) {
        userData.guilds[guildId].users[userId].background =
          "https://imgur.com/xymSRRO"; // Replace with your default background URL
      }

      if (!userData.guilds[guildId].users[userId].messageTimeout) {
        userData.guilds[guildId].users[userId].messageTimeout = Date.now();
      }

  // Increment XP for the user in the specific guild
  userData.guilds[guildId].users[userId].xp +=
    Math.floor(Math.random() * 15) + 10;

  let nextLevelXP = userData.guilds[guildId].users[userId].level * 75;
      userData.guilds[guildId].users[userId].messageTimeout = Date.now();

  // Check for level-up logic
  let xpNeededForNextLevel =
    userData.guilds[guildId].users[userId].level * nextLevelXP;

  if (userData.guilds[guildId].users[userId].xp >= xpNeededForNextLevel) {
    userData.guilds[guildId].users[userId].level += 1;
    nextLevelXP = userData.guilds[guildId].users[userId].level * 75;
    xpNeededForNextLevel =
      userData.guilds[guildId].users[userId].level * nextLevelXP;

        // Get the role ID for the current user's level
        const roleForLevel = getRoleForLevel(
          userData.guilds[guildId].users[userId].level,
          guildId,
          userId,
          userData,
        );

    // Add the role to the user if a valid role ID is found
    if (roleForLevel) {
      const member = message.guild.members.cache.get(userId);
      const role = message.guild.roles.cache.get(roleForLevel);
      if (member && role) {
        await member.roles.add(role);
      }
    }

    const levelbed = new MessageEmbed()
      .setColor("#3498db")
      .setTitle("Level Up!")
      .setAuthor(message.author.username, message.author.displayAvatarURL())
      .setDescription(
        `You have reached level ${userData.guilds[guildId].users[userId].level}!`
      )
      .setFooter(
        `XP: ${userData.guilds[guildId].users[userId].xp}/${xpNeededForNextLevel}`
      );

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("levelup")
        .setLabel("Level Up")
        .setStyle("SUCCESS")
    );
    message.channel.send({
      embeds: [levelbed],
      components: [row],
    });

    // Save updated data back to the JSON file
    fs.writeFile(
      userDataPath,
      JSON.stringify(userData, null, 2),
      (err) => {
        if (err) console.error("Error writing user data file:", err);
      }
    );
  }
});

client.slashCommands = new Collection();
const commandsFolders = fs.readdirSync("./src/slashCommands");

for (const folder of commandsFolders) {
  const commandFiles = fs
    .readdirSync(`./src/slashCommands/${folder}`)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const slashCommand = require(`./src/slashCommands/${folder}/${file}`);
    client.slashCommands.set(slashCommand.data.name, slashCommand);
    Promise.resolve(slashCommand);
  }
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const slashCommand = client.slashCommands.get(interaction.commandName);

  if (!slashCommand) return;

  try {
    await slashCommand.execute(interaction);
  } catch (error) {
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

Marksoft.react = new Map();
Marksoft.fetchforguild = new Map();

Marksoft.start(process.env.TOKEN);

process.on("unhandledRejection", (reason, p) => {
  logger.info(`[unhandledRejection] ${reason.message}`, { label: "ERROR" });
  console.log(reason, p);
});

process.on("uncaughtException", (err, origin) => {
  logger.info(`[uncaughtException] ${err.message}`, { label: "ERROR" });
  console.log(err, origin);
});

process.on("uncaughtExceptionMonitor", (err, origin) => {
  logger.info(`[uncaughtExceptionMonitor] ${err.message}`, { label: "ERROR" });
  console.log(err, origin);
});
process.on("multipleResolves", (type, promise, reason) => {
  logger.info(`[multipleResolves] MULTIPLE RESOLVES`, { label: "ERROR" });
  console.log(type, promise, reason);
});
