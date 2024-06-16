require("dotenv").config();
const { MessageEmbed } = require("discord.js");
const MarksoftClient = require("./Marksoft");
const config = require("./config.json");
const logger = require("./src/utils/logger");
const Marksoft = new MarksoftClient(config);
const axios = require('axios');

//===============================================
const tmi = require('tmi.js');
const cooldowns = {};

const clipUrlRegex = /https:\/\/clips\.twitch\.tv\/[A-Za-z0-9-]+/gi;
const ClipChannel = 'bankai';
const discordChannelId = '1251330095101120523';
const ignoredUsers = ['nightbot'];
const NaughtydiscordChannelId = '1249727604051677317';


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
}

twitchclient.on('message', (channel, userstate, message, self) => {
  if (self) return;

  const normalizedMessage = message.toLowerCase().trim();
  const commandPattern = /^(\!\w+)\b/; // Match a command at the beginning
  const match = normalizedMessage.match(commandPattern);

  if (!match) return; // If no command is found, exit

  const command = match[1]; // Extract command from the matched result
  const commandName = commandAliases[command];
  const args = normalizedMessage.slice(command.length).trim().split(/\s+/); // Extract arguments if any
  const clipUrls = message.match(clipUrlRegex);

  if (normalizedMessage.includes(ClipChannel.toLowerCase())) {
    if (clipUrls) {
      console.log(`Twitch clip detected: ${clipUrls}`);
      clipUrls.forEach(url => {
        const username = userstate['display-name'];
        sendClipToDiscord(url, username);
      });
    }
  }
  // Trigger commands based on the detected command name
  if (commandName === 'naughty') {
    handleNaughtyCommand(channel, userstate, args);
  } else if (commandName === 'accountage') {
    handleAccountageCommand(channel, userstate, args);
  }
});

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

function sendNaughtyToDiscord(twitchname) {
  
  const embed = new MessageEmbed()
    .setTitle(`Twitch Chat`)
    .setDescription(`**${twitchname}** hit the magic number 69! \n`)
    .setFooter(`Triggered  by ${twitchname}`)
    .setThumbnail(`https://i.imgur.com/2yXFtac.png`)
    .setColor('#9146FF'); // Twitch purple color

  if (Marksoft.isReady()) {
    const channel = Marksoft.channels.cache.get(NaughtydiscordChannelId);
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

function handleNaughtyCommand(channel, userstate, args) {
  const twitchname = userstate.username;
  const randomNumber = Math.floor(Math.random() * 70);

  if (cooldowns[twitchname]) return;

  const guessedNumber = parseInt(args[0]);
  let responseMessage = '';

  if (!isNaN(guessedNumber) && guessedNumber === randomNumber) {
    if (randomNumber === 69) {
      responseMessage = `${twitchname} guessed correctly! The number is **${randomNumber}** and it's a perfect 69! Congratulations! bankai1Y `;
      logger.info(`${twitchname} guessed correctly and hit 69`, { label: "Command" });
      sendNaughtyToDiscord(twitchname);
    } 
    else {
      responseMessage = `${twitchname} guessed correctly! The number is **${randomNumber}**. Congratulations! bankai1Y `;
      logger.info(`${twitchname} guessed correctly: ${randomNumber}`, { label: "Command" });
    }
  } 
  else {
    if (randomNumber === 69) {
      responseMessage = `${twitchname} is **${randomNumber}** out of 69 naughty bankai1Y `;
      logger.info(`${twitchname} is ${randomNumber} out of 69 naughty`, { label: "Command" });
      sendNaughtyToDiscord(twitchname);
    } 
    else if (randomNumber === 0) {
      responseMessage = `${twitchname} is **${randomNumber}** out of 69 naughty bankai1Rip `;
      logger.info(`${twitchname} is ${randomNumber} out of 69 naughty bankai1Rip `, { label: "Command" });
    } 
    else {
      responseMessage = `${twitchname} is **${randomNumber}** out of 69 naughty LUL`;
      logger.info(`${twitchname} is ${randomNumber} out of 69 naughty`, { label: "Command" });
    }
  }

  twitchclient.say(channel, responseMessage);

  cooldowns[twitchname] = true;
  setTimeout(() => {
    delete cooldowns[twitchname];
  }, 3000); // Cooldown period in milliseconds (3 seconds)


  twitchclient.say(channel, responseMessage);

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

/*=====================================================
=======================================================*/
const color = require("./src/data/colors");
Marksoft.color = color;

const emoji = require("./src/data/emoji");
Marksoft.emoji = emoji;

let client = Marksoft;
const jointocreate = require("./src/structures/jointocreate");
jointocreate(client);

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
