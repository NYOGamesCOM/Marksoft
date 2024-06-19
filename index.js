require("dotenv").config();
const { MessageEmbed } = require("discord.js");
const MarksoftClient = require("./Marksoft");
const config = require("./config.json");
const logger = require("./src/utils/logger");
const Marksoft = new MarksoftClient(config);
const fs = require('fs');
//===============================================
const axios = require('axios');
const tmi = require('tmi.js');
const cooldowns = {};

let winCounts = {};
const WIN_COUNTS_FILE = 'winCounts.json';
if (fs.existsSync(WIN_COUNTS_FILE)) {
    const data = fs.readFileSync(WIN_COUNTS_FILE);
    winCounts = JSON.parse(data);
}

const clipUrlRegex = /https:\/\/clips\.twitch\.tv\/\S+/gi;
const discordChannelId = '1251330095101120523';
const ignoredUsers = ['nightbot', 'streamelements'];
//const NaughtydiscordChannelId = '1249727604051677317';


const channelsFile = './channels.json';
let channels = [];

if (fs.existsSync(channelsFile)) {
    const channelsData = JSON.parse(fs.readFileSync(channelsFile, 'utf8'));
    channels = channelsData.channels;
} else {
    fs.writeFileSync(channelsFile, JSON.stringify({ channels: [] }, null, 2));
}

const channelMappingsFile = './channelMappings.json';
let channelMappings = {};
if (fs.existsSync(channelMappingsFile)) {
    channelMappings = JSON.parse(fs.readFileSync(channelMappingsFile, 'utf8')).channelMappings;
}

const twitchclient = new tmi.Client({
    connection:{
        reconnect: true,
        secure: true
    },
    identity:{
        username: process.env.TWITCH_BOT_USERNAME,
        password: process.env.TWITCH_OAUTH_TOKEN
    },
    channels: channels 
});

//twitchclient.connect();

const commandAliases = {
  '!naughty': 'naughty',
  '!69': 'naughty',
  '!accountage': 'accountage',
  '!clip': 'clip',
  '!addwin': 'addwin',
  '!resetwins': 'resetwins',
  '!wins': 'wins',
  '!clearwins': 'clearwins',
  '!jointo': 'jointo',
  '!setdiscordchannel': 'setdiscordchannel'
}

let clipRequestCount = 0;
const clipRequestThreshold = 5; 

const clipRequestTimeout = 5 * 60 * 1000; // 5 minutes
let clipRequestTimer;

function resetClipRequestCounter() {
  clipRequestCount = 0;
  if (clipRequestTimer) {
    clearTimeout(clipRequestTimer);
    clipRequestTimer = null;
  }
}

twitchclient.connect().then(() => {
  const timestamp = moment().format('YYYY-MM-DD HH:mm:ss'); // Format timestamp
  console.log(`[${timestamp}] Bot connected to Twitch.`);
  const channelsData = JSON.parse(fs.readFileSync(channelsFile, 'utf8'));
  let channels = channelsData.channels;
  channels.forEach(channel => {
      twitchclient.join(channel);
      console.log(`[${timestamp}] Joined channel ${channel}.`);
  });
}).catch(err => {
  console.error(`Error connecting to Twitch: ${err}`);
});

twitchclient.on('join', onJoinHandler);
twitchclient.on('part', onPartHandler);

const moment = require("moment");

function onJoinHandler(channel, username, self) {
  if (self) return;
  const timestamp = moment().format('YYYY-MM-DD HH:mm:ss'); // Format timestamp
  console.log(`[${timestamp}] ${username} has joined ${channel}`);
}

function onPartHandler(channel, username, self) {
  if (self) return;
  const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
  console.log(`[${timestamp}] ${username} has left ${channel}`);
}

function handleSetDiscordChannelCommand(channel, userstate, args) {
  const twitchname = userstate.username;
  const discordChannelId = args[0];
  if (twitchname.toLowerCase() !== '13thomas') {
    twitchclient.say(channel, 'You are not authorized to use this command.');
    return;
  }
  channelMappings[channel.slice(1).toLowerCase()] = discordChannelId; // Slice to remove the '#' from the channel name

  fs.writeFileSync(channelMappingsFile, JSON.stringify({ channelMappings }, null, 2));

  twitchclient.say(channel, `Discord channel ID set for ${channel} to ${discordChannelId}`);
  logger.info(`${twitchname} set discord ${discordChannelId} for ${channel}`, { label: "Command" });
}

function handleJoinToChannel(channel, userstate, args) {
  const channelName = args[0];
  const twitchname = userstate.username;
  if (twitchname.toLowerCase() !== '13thomas') {
    twitchclient.say(channel, 'You are not authorized to use this command.');
    return;
  }
  if (channels.includes(channelName)) {
    twitchclient.say(channel, `I'm already in ${channelName}'s chat!`);
      return;
  }
  channels.push(channelName);
  fs.writeFileSync(channelsFile, JSON.stringify({ channels }, null, 2));

  twitchclient.join(channelName).then(() => {
      console.log(`Bot joined channel ${channelName}`);
      logger.info(`${twitchname} joined the bot to ${channelName}`, { label: "Command" });
      twitchclient.say(channel, `Successfully joined ${channelName}'s chat!`);
  }).catch((err) => {
      console.error(`Error joining channel ${channelName}: ${err}`);
      twitchclient.say(channel, `Failed to join ${channelName}'s chat: ${err}`);
  });
}

twitchclient.on('message', async (channel, userstate, message, self) => {
  if (self) return;

  const normalizedMessage = message.toLowerCase().trim();
  const commandPattern = /^(\!\w+)\b/;
  const match = normalizedMessage.match(commandPattern);

  const clipUrls = message.match(clipUrlRegex);
  if (clipUrls) {
    console.log(`Twitch clip detected: ${clipUrls}`);
    clipUrls.forEach(url => {
      const username = userstate['display-name'];
      sendClipToDiscord(url, username);
    });
  }

  if (!match) return;

  const command = match[1];
  const commandName = commandAliases[command];
  const args = normalizedMessage.slice(command.length).trim().split(/\s+/);


  if (command  === '!clip') {
    clipRequestCount++;
    console.log('!clip triggered');
    if (clipRequestCount === 1 || !clipRequestTimer) {
      clipRequestTimer = setTimeout(resetClipRequestCounter, clipRequestTimeout);
    }
    if (clipRequestCount >= clipRequestThreshold) {
      try {
        const broadcasterId = await getBroadcasterId(channel);
        const clipUrl = await createTwitchClip(broadcasterId);
        twitchclient.say(channel, `Clip created! Watch it here: ${clipUrl}`);
        resetClipRequestCounter();
      } catch (error) {
        twitchclient.say(channel, `Failed to create clip.`);
        console.error(`Clip creation failed: ${error.message}`);
        resetClipRequestCounter();
      }
    }
  }
  else if (commandName === 'naughty') {
    handleNaughtyCommand(channel, userstate, args);
  } 
  else if (commandName === 'accountage') {
    handleAccountageCommand(channel, userstate, args);
  }
  else if (commandName === 'addwin') {
    handleAddwinCommand(channel, userstate, args);
  }
  else if (commandName === 'resetwins') {
    handleResetwinsCommand(channel, userstate, args);
  }
  else if (commandName === 'wins') {
    handleWinsCommand(channel, userstate, args);
  }
  else if (commandName === 'clearwins') {
    twitchclient.say(channel, `I'm not a dodo bot like @Nightbot :) !resetwins will do the work.`);
  }
  else if (commandName === 'jointo') {
    handleJoinToChannel(channel, userstate, args);
  }
  else if (commandName === 'setdiscordchannel') {
    handleSetDiscordChannelCommand(channel, userstate, args);
  }
});


// Add a win
function handleAddwinCommand(channel, userstate) {
  // Check if the user is a moderator or broadcaster
  if (userstate.mod || userstate['user-type'] === 'mod' || userstate.badges.broadcaster) {
      if (!winCounts[channel]) {
          winCounts[channel] = 0;
      }
      winCounts[channel] += 1;
      saveWinCounts();
      twitchclient.say(channel, `Win added for ${channel}! Current win count: ${winCounts[channel]}`);
  } else {
    twitchclient.say(channel, 'Only moderators can use the !addwin command.');
  }
}

// Reset the win count
function handleResetwinsCommand(channel, userstate) {
  // Check if the user is the broadcaster or a moderator
  if (userstate.badges.broadcaster || userstate.mod || userstate['user-type'] === 'mod') {
      if (winCounts[channel]) {
          winCounts[channel] = 0;
          saveWinCounts();
          twitchclient.say(channel, `Win count reset for ${channel} to 0.`);
      } else {
        twitchclient.say(channel, `No win count found for ${channel}.`);
      }
  } else {
    twitchclient.say(channel, 'Only moderators can use the !resetwins command.');
  }
}

function handleWinsCommand(channel) {
  if (winCounts[channel]) {
    twitchclient.say(channel, `Wins today: ${winCounts[channel]}`);
  } else {
    twitchclient.say(channel, `No win found for ${channel}.`);
  }
}

function saveWinCounts() {
  fs.writeFileSync(WIN_COUNTS_FILE, JSON.stringify(winCounts));
}

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

function sendNaughtyToDiscord(channel, twitchname) {
  try {
      console.log(`Sending naughty message to Discord for Twitch channel: ${channel}`);

      // Read channel mappings from JSON file
      const channelMappings = JSON.parse(fs.readFileSync(channelMappingsFile, 'utf8'));
      console.log('Channel mappings:', channelMappings);

      // Get NaughtydiscordChannelId based on Twitch channel
      const lowercaseChannelName = channel.slice(1).toLowerCase(); // Remove '#' and convert to lowercase
      const NaughtydiscordChannelId = channelMappings[lowercaseChannelName];

      if (!NaughtydiscordChannelId) {
          throw new Error(`Discord channel ID not found for Twitch channel: ${channel}`);
      }

      const embed = new MessageEmbed()
          .setTitle(`Twitch Chat`)
          .setDescription(`**${twitchname}** hit the magic number 69! \n`)
          .setFooter(`Triggered by ${twitchname}`)
          .setThumbnail(`https://i.imgur.com/2yXFtac.png`)
          .setColor('#9146FF'); // Twitch purple color

      // Send embed to Discord
      if (Marksoft.isReady()) {
          const discordChannel = Marksoft.channels.cache.get(NaughtydiscordChannelId);
          if (discordChannel) {
              discordChannel.send({ embeds: [embed] })
                  .then(message => console.log(`Sent embed: ${message.id}`))
                  .catch(error => console.error(`Error sending embed to Discord: ${error}`));
          } else {
              throw new Error(`Discord channel not found for ID: ${NaughtydiscordChannelId}`);
          }
      } else {
          throw new Error('Discord client not ready.');
      }
  } catch (error) {
      console.error(`Error in sendNaughtyToDiscord: ${error}`);
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

  const guessedCorrectly = !isNaN(guessedNumber) && guessedNumber === randomNumber;
  const hit69 = randomNumber === 69;
  
  if (guessedCorrectly) {
    if (hit69) {
      responseMessage = `${twitchname} guessed correctly! The number is ${randomNumber} and it's a perfect 69! Congratulations! bankai1Y `;
      logger.info(`${channel} | ${twitchname} guessed correctly and hit 69 🎉`, { label: "Command" });
      sendNaughtyToDiscord(channel, twitchname); 
    } else {
      responseMessage = `${twitchname} guessed correctly! The number is ${randomNumber}. Congratulations! bankai1Y `;
      logger.info(`${channel} | ${twitchname} guessed correctly: ${randomNumber}`, { label: "Command" });
    }
  } else {
    if (hit69) {
      responseMessage = `${twitchname} is ${randomNumber} out of 69 naughty bankai1Y `;
      logger.info(`${channel} | ${twitchname} is ${randomNumber} out of 69 naughty 🎉`, { label: "Command" });
      sendNaughtyToDiscord(channel, twitchname);
    } else if (randomNumber === 0) {
      responseMessage = `${twitchname} is ${randomNumber} out of 69 naughty bankai1Rip `;
      logger.info(`${channel} | ${twitchname} is ${randomNumber} out of 69 naughty bankai1Rip `, { label: "Command" });
    } else {
      responseMessage = `${twitchname} is ${randomNumber} out of 69 naughty LUL`;
      logger.info(`${channel} | ${twitchname} is ${randomNumber} out of 69 naughty`, { label: "Command" });
    }
  }
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