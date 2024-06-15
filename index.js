require("dotenv").config();
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const MarksoftClient = require("./Marksoft");
const config = require("./config.json");
//const deploy = require("./src/deployCommands.js");
//const path = require("node:path");
const { Collection } = require("discord.js");
const logger = require("./src/utils/logger");
const fs = require("node:fs");
const Marksoft = new MarksoftClient(config);

/*  TWITCH  
      NAUGHTY
        COMMAND
          MERGED 
            WITH 
              DISCORD 
*/

const tmi = require('tmi.js');
const cooldowns = {};

const { setMapping, removeMapping, getAllMappings } = require('./channelMappings');

const twitchclient = new tmi.Client({
    connection:{
        reconnect: true,
        secure: true
    },
    identity:{
        username: process.env.TWITCH_BOT_USERNAME,
        password: process.env.TWITCH_OAUTH_TOKEN
    },
    channels: ['13Thomas', 'BanKai']
});

twitchclient.connect();

const commandAliases = {
  '!naughty': 'naughty',
  '!69': 'naughty',
  '!accountage': 'accountage'
//  '!followage': 'followage'
}

//const clipUrlRegex = /https:\/\/clips\.twitch\.tv\/[A-Za-z0-9]+|https:\/\/www\.twitch\.tv\/(?:.*\/)?clip\/[A-Za-z0-9]+/gi;
const clipUrlRegex = /https:\/\/clips\.twitch\.tv\/[A-Za-z0-9-]+/gi;


twitchclient.on('message', (channel, userstate, message, self) => {
  // Ignore messages from the bot itself
  if (self) return;

  const normalizedMessage = message.toLowerCase().trim();
  const commandName = commandAliases[normalizedMessage];
  const clipUrls = message.match(clipUrlRegex);

  if (clipUrls) {
    clipUrls.forEach(url => {
      console.log(`Detected clip URL: ${url}`);
      const username = userstate['display-name'];
      sendClipToDiscord(url, username);
    });
  }
  if (commandName === 'naughty') {
    handleNaughtyCommand(channel, userstate);
  }
  else if (commandName === 'accountage') {
    handleAccountageCommand(channel, userstate);
  }

});

const discordChannelId = '1251330095101120523';
const ignoredUsers = ['nightbot', 'streamelements'];

function shouldIgnoreUser(username) {
  return ignoredUsers.includes(username.toLowerCase());
}

function sendClipToDiscord(url, username) {
  if (shouldIgnoreUser(username)) {
    console.log(`Ignoring clip from ${username}: ${url}`);
    return;
  }

  const embed = new MessageEmbed()
    .setTitle(`Twitch Chat Clip`)
    .setDescription(`**${username}** shared a clip in the twitch chat \n\n ${url} `)
    .setFooter(`Sent by ${username}`)
    .setColor('#9146FF'); // Twitch purple color

  if (Marksoft.isReady()) {
    const channel = Marksoft.channels.cache.get(discordChannelId);
    if (channel) {
      channel.send({ embeds: [embed] })
        .then(message => console.log(`Sent embed: ${message.id}`))
        .catch(console.error);
    } else {
      console.error('Discord channel not found.');
    }
  } else {
    console.error('Discord client not ready.');
  }
}

function handleAccountageCommand(channel, userstate) {
  const username = userstate['display-name'];

  fetch(`https://api.twitch.tv/helix/users?login=${username}`, {
    headers: {
      'Client-ID': process.env.TWITCH_CLIENT_ID,
      'Authorization': `Bearer ${process.env.TWITCH_OAUTH_TOKEN}`
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Twitch API responded with status ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    if (data.data && data.data.length > 0) {
      const user = data.data[0];
      const createdDate = new Date(user.created_at);
      const accountAge = calculateAccountAge(createdDate);
      twitchclient.say(channel, `@${username} was created ${accountAge} ago on ${createdDate.toDateString()}`);
    } else {
      twitchclient.say(channel, `@${username}, no account data found.`);
      console.log(`No account data found for ${username}`);
    }
  })
  .catch(err => {
    console.error(`Error fetching user data: ${err}`);
    twitchclient.say(channel, `@${username}, there was an error retrieving your account data.`);
  });
}

function handleNaughtyCommand(channel, userstate) {
  const twitchname = userstate.username;

  // Check if the user is on cooldown
  if (cooldowns[twitchname]) return;

  // Generate a random number between 1 and 69
  const randomNumber = Math.floor(Math.random() * 69) + 1;

  if (randomNumber === 69) {
      twitchclient.say(channel, `${twitchname} is ${randomNumber} out of 69 naughty 🎉`);
      //console.log(`[twitch] ${twitchname} is ${randomNumber} out of 69 naughty`);
      logger.info(`${twitchname} is ${randomNumber} out of 69 naughty 🎉`, { label: "Command" });
  } else {
      twitchclient.say(channel, `${twitchname} is ${randomNumber} out of 69 naughty LUL`);
      //console.log(`[twitch] ${twitchname} is ${randomNumber} out of 69 naughty`);
      logger.info(`${twitchname} is ${randomNumber} out of 69 naughty`, { label: "Command" });
  }

  // Set cooldown for the user
  cooldowns[twitchname] = true;
  setTimeout(() => {
      delete cooldowns[twitchname];
  }, 3000); // Cooldown period in milliseconds (3 seconds)
}

function calculateAccountAge(createdDate) {
  const now = new Date();
  const diff = Math.abs(now - createdDate);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  if (years > 0) {
    return `${years} year${years > 1 ? 's' : ''} and ${months} month${months > 1 ? 's' : ''}`;
  } else {
    return `${months} month${months > 1 ? 's' : ''}`;
  }
}
/*
function updateCounter(twitchname) {
  const guildId = "342836262060949524"; // Replace with your actual guild ID
  const nguildData = nuserData[guildId];

  if (nguildData) {
      // Find the user by twitchname
      let user = nguildData.users.find(user => user.twitchname === twitchname);

      if (!user) {
          // Add new user if not found
          user = {
              username: "", // Keep this empty if it's not available
              userId: "",//generateNewUserId(), // Implement this to generate a new ID
              counter: 0,
              date: new Date().toISOString(),
              usage: 0,
              twitchname: twitchname
          };
          nguildData.users.push(user);
      }

      // Increment the counter
      user.counter += 1;
      user.date = new Date().toISOString();

      // Save updated data back to the JSON file
      fs.writeFileSync(userDataPath, JSON.stringify(nuserData, null, 2), 'utf-8');
      console.log(`Counter updated for ${twitchname}: ${user.counter}`);
  } else {
      console.log(`Guild with ID ${guildId} not found.`);
  }
}

// Implement the generateNewUserId function as needed
function generateNewUserId() {
  // Implement a unique ID generation mechanism here
  return 'unique_user_id_' + Date.now(); // Example implementation
}*/
/*=====================================================
=======================================================
=======================================================*/
const color = require("./src/data/colors");
Marksoft.color = color;

const emoji = require("./src/data/emoji");
Marksoft.emoji = emoji;

let client = Marksoft;
const jointocreate = require("./src/structures/jointocreate");
jointocreate(client);

//const userData = require("./src/data/users.json");

client.on("messageCreate", async (message) => {
  if (message.author.bot) {
    return;
  }

  const guildId = message.guild?.id;

  if (!guildId) {
    console.error("Guild ID is undefined");
    return;
  }

  const userId = message.author.id;

  const userDataPath = "./src/data/users.json";
  let userData = {};
  try {
    const userDataFileContent = fs.readFileSync(userDataPath, "utf-8");
    userData = JSON.parse(userDataFileContent);
  } catch (error) {
    console.error("Error reading user data file:", error);
  }

  if (!userData.guilds) {
    userData.guilds = {};
  }

  if (!userData.guilds[guildId]) {
    userData.guilds[guildId] = {
      users: {},
      levelingEnabled: true,
    };
  }

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
          "https://imgur.com/xymSRRO";
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

// Function to get guild configuration, create if not exists
/*function getGuildConfig(guildId) {
  if (!userData.guilds[guildId]) {
    userData.guilds[guildId] = {
      users: {},
      levelingEnabled: true, // Add a new property to enable/disable leveling
    };
  }
  return userData.guilds[guildId];
}*/

// Function to get role ID for the current user's level
function getRoleForLevel(level, guildId, userId, userData) {
  if (!userData.guilds[guildId]?.users[userId]) {
    return null;
  }

  const { levelUpRoles } = userData.guilds[guildId];

  if (!levelUpRoles) {
    return null;
  }

  // Find the role ID for the current user's level
  const roleForLevel = levelUpRoles.find((role) => role.level === level);

  // If roleForLevel is found, return its roleId; otherwise, use the default mapping
  return roleForLevel?.roleId || getRoleIdForLevel(level, guildId, userData);
}

// Default role ID mapping (replace with your actual role IDs)
function getRoleIdForLevel(level, guildId, userData) {
  // Retrieve role IDs from the JSON file based on the guild and level
  const guildRoles = userData.guilds[guildId]?.levelUpRoles || {};
  return guildRoles[level]?.roleId || null;
}

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
