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

//const clipUrlRegex = /https:\/\/clips\.twitch\.tv\/[A-Za-z0-9-]+/gi;
const clipUrlRegex = /https:\/\/clips\.twitch\.tv\/\S+/gi;
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
  '!accountage': 'accountage',
  '!clip': 'clip'
}

// In-memory counter for clip requests
let clipRequestCount = 0;
const clipRequestThreshold = 5; // Number of !clip commands required

// Reset counter after a specified timeout (e.g., 5 minutes)
const clipRequestTimeout = 5 * 60 * 1000; // 5 minutes
let clipRequestTimer;

// Reset function to clear the counter and timer
function resetClipRequestCounter() {
  clipRequestCount = 0;
  if (clipRequestTimer) {
    clearTimeout(clipRequestTimer);
    clipRequestTimer = null;
  }
}

twitchclient.on('message', async (channel, userstate, message, self) => {
  if (self) return;

  const normalizedMessage = message.toLowerCase().trim();
  const commandPattern = /^(\!\w+)\b/; // Match a command at the beginning
  const match = normalizedMessage.match(commandPattern);

  // Extract clip URLs
  const clipUrls = message.match(clipUrlRegex);
  if (clipUrls) {
    console.log(`Twitch clip detected: ${clipUrls}`);
    clipUrls.forEach(url => {
      const username = userstate['display-name'];
      sendClipToDiscord(url, username);
    });
  }

  // If no command is found, exit
  if (!match) return;

  const command = match[1]; // Extract command from the matched result
  const commandName = commandAliases[command];
  const args = normalizedMessage.slice(command.length).trim().split(/\s+/); // Extract arguments if any
  if (command  === '!clip') {
    clipRequestCount++;
    console.log('!clip triggered');
    // Reset the timer if it's the first request or the timer is not running
    if (clipRequestCount === 1 || !clipRequestTimer) {
      clipRequestTimer = setTimeout(resetClipRequestCounter, clipRequestTimeout);
    }

    // Create the clip if the threshold is reached
    if (clipRequestCount >= clipRequestThreshold) {
      try {
        const broadcasterId = await getBroadcasterId(channel);
        const clipUrl = await createTwitchClip(broadcasterId);
        twitchclient.say(channel, `Clip created! Watch it here: ${clipUrl}`);
        resetClipRequestCounter(); // Reset the counter after creating the clip
      } catch (error) {
        twitchclient.say(channel, `Failed to create clip.`);
        console.error(`Clip creation failed: ${error.message}`);
        resetClipRequestCounter(); // Reset the counter even if there is an error
      }
    }
  }
  // Trigger commands based on the detected command name
  else if (commandName === 'naughty') {
    handleNaughtyCommand(channel, userstate, args);
  } else if (commandName === 'accountage') {
    handleAccountageCommand(channel, userstate, args);
  }
});

// Function to get broadcaster ID
async function getBroadcasterId(channel) {
  try {
    const response = await axios.get(
      `https://api.twitch.tv/helix/users?login=${channel}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.TWITCH_ACCESS_TOKEN}`,
          'Client-Id': process.env.TWITCH_CLIENT_ID
        }
      }
    );

    if (response.data.data.length > 0) {
      return response.data.data[0].id;
    } else {
      throw new Error('Broadcaster not found.');
    }
  } catch (error) {
    console.error(`Error fetching broadcaster ID: ${error.message}`);
    throw new Error('Failed to fetch broadcaster ID.');
  }
}

// Function to create Twitch clip
async function createTwitchClip(broadcasterId) {
  try {
    const response = await axios.post(
      `https://api.twitch.tv/helix/clips?broadcaster_id=${broadcasterId}`,
      null,
      {
        headers: {
          'Authorization': `Bearer ${process.env.TWITCH_ACCESS_TOKEN}`,
          'Client-Id': process.env.TWITCH_CLIENT_ID,
          'Content-Type': 'application/json'
        }
      }
    );

    const clipUrl = `https://clips.twitch.tv/${response.data.data[0].id}`;
    console.log(`Clip created: ${clipUrl}`);
    return clipUrl;
  } catch (error) {
    console.error(`Error creating clip: ${error.response ? error.response.data : error.message}`);
    throw new Error('Failed to create clip.');
  }
}

function shouldIgnoreUser(username) {
  return ignoredUsers.includes(username.toLowerCase());
}

function sendClipToDiscord(url, username, twitchChannel) {
  if (shouldIgnoreUser(username)) {
    console.log(`Ignoring clip from ${username}: ${url}`);
    return;
  }

  const embed = new MessageEmbed()
    .setTitle(`Twitch Chat Clip`)
    .setDescription(`**${username}** shared a clip in **${twitchChannel}** channel\n\n[Watch the clip](${url})`)
    //.setDescription(`**${username}** shared a clip in the twitch chat \n\n ${url} `)
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
  const guessedNumber = parseInt(args[0]);

  if (cooldowns[twitchname]) return;

  let responseMessage = '';

  // Check if the guessed number is valid
  const guessedCorrectly = !isNaN(guessedNumber) && guessedNumber === randomNumber;
  const hit69 = randomNumber === 69;
  
  if (guessedCorrectly) {
    if (hit69) {
      // Special message for guessing correctly and hitting 69
      responseMessage = `${twitchname} guessed correctly! The number is ${randomNumber} and it's a perfect 69! Congratulations! bankai1Y `;
      logger.info(`${twitchname} guessed correctly and hit 69 🎉`, { label: "Command" });
      sendNaughtyToDiscord(twitchname);
    } else {
      // Message for guessing correctly but not hitting 69
      responseMessage = `${twitchname} guessed correctly! The number is ${randomNumber}. Congratulations! bankai1Y `;
      logger.info(`${twitchname} guessed correctly: ${randomNumber}`, { label: "Command" });
    }
  } else {
    // Handle random number results if the guess was incorrect or not provided
    if (hit69) {
      responseMessage = `${twitchname} is ${randomNumber} out of 69 naughty bankai1Y `;
      logger.info(`${twitchname} is ${randomNumber} out of 69 naughty 🎉`, { label: "Command" });
      sendNaughtyToDiscord(twitchname);
    } else if (randomNumber === 0) {
      responseMessage = `${twitchname} is ${randomNumber} out of 69 naughty bankai1Rip `;
      logger.info(`${twitchname} is ${randomNumber} out of 69 naughty bankai1Rip `, { label: "Command" });
    } else {
      responseMessage = `${twitchname} is ${randomNumber} out of 69 naughty LUL`;
      logger.info(`${twitchname} is ${randomNumber} out of 69 naughty`, { label: "Command" });
    }
  }

  // Send the response message to the channel
  twitchclient.say(channel, responseMessage);

  // Implement the cooldown for the user
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
