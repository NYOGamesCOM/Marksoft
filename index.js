require("dotenv").config();
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const MarksoftClient = require("./Marksoft");
const config = require("./config.json");
const logger = require("./src/utils/logger");
const Marksoft = new MarksoftClient(config);
const fs = require('fs');
const moment = require("moment");
//const { twitchclient, checkStreamerLiveStatus } = require('./twitch/twitch');
//const { loadStreamers } = require('./twitch/fileManager');
//const streamers = loadStreamers();
//===============================================
const path = require('path');
const axios = require('axios');
const tmi = require('tmi.js');
const cooldowns = {};
const WATCHTIME_FILE = path.join(__dirname, 'watchtime.json');

let watchtimes = {};
let joinTimes = {};
let winCounts = {};

function loadWatchtimes() {
  try {
      if (fs.existsSync(WATCHTIME_FILE)) {
          const data = fs.readFileSync(WATCHTIME_FILE, 'utf8');
          watchtimes = JSON.parse(data);
          //console.log('Watchtimes loaded:', watchtimes);
      }
  } catch (err) {
      console.error('Error reading watchtime file:', err);
  }
}

function saveWatchtimes() {
  try {
      fs.writeFileSync(WATCHTIME_FILE, JSON.stringify(watchtimes, null, 2));
      //console.log('Watchtimes saved:', watchtimes);
  } catch (err) {
      console.error('Error saving watchtime file:', err);
  }
}

const WIN_COUNTS_FILE = 'winCounts.json';
if (fs.existsSync(WIN_COUNTS_FILE)) {
    const data = fs.readFileSync(WIN_COUNTS_FILE);
    winCounts = JSON.parse(data);
}

const clipUrlRegex = /https:\/\/clips\.twitch\.tv\/\S+/gi;
const ignoredUsers = ['nightbot', 'streamelements'];


const channelsFile = './channels.json';
let channels = [];

if (fs.existsSync(channelsFile)) {
    const channelsData = JSON.parse(fs.readFileSync(channelsFile, 'utf8'));
    channels = channelsData.channels;
} else {
    fs.writeFileSync(channelsFile, JSON.stringify({ channels: [] }, null, 2));
}

const channelMappingsFile = './channelMappings.json'; // Adjust path as needed
let channelMappings = {};

// Load channel mappings from JSON file
if (fs.existsSync(channelMappingsFile)) {
    channelMappings = JSON.parse(fs.readFileSync(channelMappingsFile, 'utf8')).channelMappings;
    //console.log('Loaded channel mappings:', channelMappings);
} else {
    console.error('channelMappings.json not found.');
}

const clipsMappingsFile = './clipsMappings.json';
let clipsMappings = [];

if (fs.existsSync(clipsMappingsFile)) {
  const data = fs.readFileSync(clipsMappingsFile, 'utf8');
  clipsMappings = JSON.parse(data).clipsMappings;
} else {
  console.error('clipsMappings.json not found.');
}

const twitchclient = new tmi.Client({
    options: {debug: false},
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
  '!setachievementchannel': 'setachievementchannel',
  '!setclipschannel': 'setclipschannel',
  '!channels': 'channels',
  '!setlivechannel': 'setlivechannel',
  '!watchtime': 'watchtime'
}

let clipRequestCount = 0;
const clipRequestThreshold = 5; 

const clipRequestTimeout = 5 * 60 * 1000; // 5 minutes
let clipRequestTimer;

loadWatchtimes();

let liveStatus = {};

function loadStreamers() {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'streamers.json'));
    return JSON.parse(data).streamers;
  } catch (error) {
    console.error('Error reading streamers file:', error);
    return [];
  }
}

function saveStreamers(streamers) {
  try {
    fs.writeFileSync(path.join(__dirname, 'streamers.json'), JSON.stringify({ streamers }, null, 2));
  } catch (error) {
    console.error('Error saving streamers file:', error);
  }
}

const streamers = loadStreamers();

async function checkStreamerLiveStatus(streamer) {
  try {
    const response = await axios.get(
      `https://api.twitch.tv/helix/streams?user_login=${streamer.twitchUsername}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.TWITCH_OAUTH_TOKEN}`,
          'Client-Id': process.env.TWITCH_CLIENT_ID,
        },
      }
    );

    const stream = response.data.data[0];
    const isLive = !!stream;
    if (isLive && !liveStatus[streamer.twitchUsername]) {
      //console.log(`${streamer.twitchUsername} is live!`);
      liveStatus[streamer.twitchUsername] = true;
      sendLiveNotificationToDiscord(streamer, stream);
    } else if (!isLive && liveStatus[streamer.twitchUsername]) {
      //console.log(`${streamer.twitchUsername} is no longer live.`);
      liveStatus[streamer.twitchUsername] = false;
    } else {
      //console.log(`${streamer.twitchUsername} live status unchanged.`);
    }
  } catch (error) {
    console.error(`Error fetching live status for ${streamer.twitchUsername}: ${error.message}`);
  }
}

async function sendLiveNotificationToDiscord(streamer, stream) {
  const textMessage = `🔴 **${streamer.twitchUsername}** is now live on Twitch! Check out their stream here: https://www.twitch.tv/${streamer.twitchUsername}`;

  const embed = new MessageEmbed()
    .setTitle(`${streamer.twitchUsername} is Live!`)
    .setDescription(stream.title)
    .setURL(`https://www.twitch.tv/${streamer.twitchUsername}`)
    .setColor('#9146FF')
    .setImage(stream.thumbnail_url.replace('{width}', '640').replace('{height}', '360'))
    .addFields(
      { name: 'Game', value: stream.game_name, inline: true },
      { name: 'Viewers', value: stream.viewer_count.toString(), inline: true }
    );

  // Adding a button to watch the stream
  const button = new MessageButton()
    .setLabel('Watch Stream')
    .setStyle('LINK')
    .setURL(`https://www.twitch.tv/${streamer.twitchUsername}`);

  const row = new MessageActionRow()
    .addComponents(button);

  const channel = await Marksoft.channels.fetch(streamer.discordChannelId);
  if (channel) {
    try {
      await channel.send({ content: textMessage, embeds: [embed], components: [row] });
      //console.log(`Sent live notification for ${streamer.twitchUsername} in channel ${streamer.discordChannelId}`);
    } catch (error) {
      console.error(`Error sending message to Discord channel: ${error.message}`);
    }
  } else {
    console.error(`Discord channel not found for ${streamer.twitchUsername}: ${streamer.discordChannelId}`);
  }
}

setInterval(() => {
  streamers.forEach(checkStreamerLiveStatus);
}, 2 * 60 * 1000);

function resetClipRequestCounter() {
  clipRequestCount = 0;
  if (clipRequestTimer) {
    clearTimeout(clipRequestTimer);
    clipRequestTimer = null;
  }
}


// =================================================== CUSTOM COMMANDS =================================================
// =====================================================================================================================
let customCommands = {};

// Load custom commands from file
function loadCommands(channel) {
    const filePath = path.join(__dirname, 'commands', `${channel}.json`);
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath);
        customCommands[channel] = JSON.parse(data);
    } else {
        customCommands[channel] = {};
    }
}

// Save custom commands to file
function saveCommands(channel) {
    const dirPath = path.join(__dirname, 'commands');
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }
    const filePath = path.join(dirPath, `${channel}.json`);
    fs.writeFileSync(filePath, JSON.stringify(customCommands[channel], null, 2));
}

// Create a new command
function createCommand(channel, command, response) {
    customCommands[channel][command] = response;
    saveCommands(channel);
}

// Load commands for all channels on startup
twitchclient.getChannels().forEach(channel => {
  loadCommands(channel.slice(1)); // Remove the '#' from channel name
});

//================================================================================================================================
//================================================================================================================================

function handleSetLiveChannelCommand(channel, userstate, args) {
  const twitchChannel = channel.slice(1);
  const discordChannelId = args[0];

  let streamers = loadStreamers();
  let streamer = streamers.find(s => s.twitchUsername.toLowerCase() === twitchChannel.toLowerCase());

  if (streamer) {
    streamer.discordChannelId = discordChannelId;
  } else {
    streamers.push({ twitchUsername: twitchChannel, discordChannelId });
  }
  saveStreamers(streamers);
  twitchclient.say(channel, `Live notification channel set for ${twitchChannel} to ${discordChannelId}`);
}
/* eslint-disable-next-line no-unused-vars */
function handleWatchtimeCommand(channel, userstate, args) {
  updateWatchtime(channel, userstate.username);
  if (!watchtimes[channel]) watchtimes[channel] = {};
  if (!watchtimes[channel][userstate.username]) watchtimes[channel][userstate.username] = 0;

  const watchtime = watchtimes[channel][userstate.username];
  const formattedWatchtime = formatDuration(watchtime);
  twitchclient.say(channel, `${userstate.username}, you have watched for ${formattedWatchtime}!`);
}


function handleSetClipsChannelCommand(channel, userstate, args) {
  const twitchname = userstate.username;
  const discordChannelId = args[0];
  if (twitchname.toLowerCase() !== '13thomas') {
    twitchclient.say(channel, 'You are not authorized to use this command.');
    return;
  }
  clipsMappings[channel.slice(1).toLowerCase()] = discordChannelId;

  fs.writeFileSync(clipsMappingsFile, JSON.stringify({ clipsMappings }, null, 2));

  twitchclient.say(channel, `Clips channel set for ${channel} to ${discordChannelId}`);
  logger.info(`${twitchname} set discord ${discordChannelId} for ${channel}`, { label: "Command" });
}

function handleChannelsCommand(channel, userstate) {
  const twitchname = userstate.username;

  if (twitchname.toLowerCase() !== '13thomas') {
    twitchclient.say(channel, 'You are not authorized to use this command.');
    return;
  }

  const channelList = channels.map(channel => channel.startsWith('#') ? channel.slice(1) : channel);
  if (channelList.length === 0) {
    twitchclient.say(channel, `The bot is not currently in any Twitch channels.`);
  } else {
    twitchclient.say(channel, `The bot is used by: ${channelList.join(', ')}`);
  }
}

function handleSetDiscordChannelCommand(channel, userstate, args) {
  const twitchname = userstate.username;
  const discordChannelId = args[0];

  if (twitchname.toLowerCase() !== '13thomas') {
      twitchclient.say(channel, 'You are not authorized to use this command.');
      return;
  }

  channelMappings[channel.slice(1).toLowerCase()] = discordChannelId;

  fs.writeFileSync(channelMappingsFile, JSON.stringify({ channelMappings }, null, 2));

  twitchclient.say(channel, `Naughty achievement channel set for ${channel} to ${discordChannelId}`);
  logger.info(`${twitchname} set discord ${discordChannelId} for ${channel}`, { label: "Command" });
}

function handleJoinToChannel(channel, userstate, args) {
  const channelName = args[0];
  const twitchname = userstate.username;

  if (twitchname.toLowerCase() !== '13thomas') {
    twitchclient.say(channel, 'You are not authorized to use this command.');
    return;
  }

  const normalizedChannelName = channelName.toLowerCase();

  if (channels.includes(normalizedChannelName)) {
    twitchclient.say(channel, `I'm already in ${channelName}'s chat!`);
    return;
  }

  channels.push(normalizedChannelName);

  fs.writeFileSync(channelsFile, JSON.stringify({ channels }, null, 2));

  twitchclient.join(channelName).then(() => {
    //console.log(`Bot joined channel ${channelName}`);
    logger.info(`${twitchname} joined the bot to ${channelName}`, { label: "Command" });
    twitchclient.say(channel, `Successfully joined ${channelName}'s chat!`);
  }).catch((err) => {
    console.error(`Error joining channel ${channelName}: ${err}`);
    twitchclient.say(channel, `Failed to join ${channelName}'s chat: ${err}`);
  });
}

function handleAddwinCommand(channel, userstate) {
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

function handleResetwinsCommand(channel, userstate) {
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

// Function to create a Twitch clip
async function createTwitchClip(broadcasterId) {
  try {
    const response = await axios.post(
      `https://api.twitch.tv/helix/clips?broadcaster_id=${broadcasterId}`,
      null,
      {
        headers: {
          'Authorization': `Bearer ${process.env.TWITCH_OAUTH_TOKEN}`,
          'Client-Id': process.env.TWITCH_CLIENT_ID,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status === 202 && response.data.data.length > 0) {
      const clipUrl = `https://clips.twitch.tv/${response.data.data[0].id}`;
      return clipUrl;
    } else {
      throw new Error('Clip creation failed: No clip ID returned from Twitch API.');
    }
  } catch (error) {
    console.error(`Error creating clip: ${error.message}`);
    throw new Error('Clip creation failed.');
  }
}

// Function to get broadcaster ID from channel name
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

    if (response.status === 200 && response.data.data.length > 0) {
      return response.data.data[0].id;
    } else {
      throw new Error('Broadcaster not found.');
    }
  } catch (error) {
    console.error(`Error fetching broadcaster ID: ${error.message}`);
    throw new Error('Failed to fetch broadcaster ID.');
  }
}

function shouldIgnoreUser(username) {
  return ignoredUsers.includes(username.toLowerCase());
}

function sendClipToDiscord(url, username, channel) {
  if (shouldIgnoreUser(username)) {
    //console.log(`Ignoring clip from ${username}: ${url}`);
    return;
  }

  const normalizedChannelName = channel.startsWith('#') ? channel.slice(1).toLowerCase() : channel.toLowerCase();
  const discordChannelId = clipsMappings[normalizedChannelName];

  //console.log(`Discord Channel ID for ${channel}: ${discordChannelId}`);

  if (!discordChannelId) {
    console.error(`Discord channel ID not found for Twitch channel: ${channel}`);
    return;
  }

  const embed = new MessageEmbed()
    .setTitle(`Twitch Chat Clip`)
    .setDescription(`**${username}** shared a clip in **${channel}** channel`)
    .addField('Watch the Clip', `[Watch Now](${url})`)
    .setFooter(`Sent by ${username}`)
    .setColor('#9146FF'); // Twitch purple color

  // Adding a button to watch the clip
  const button = new MessageButton()
    .setLabel('Watch Clip')
    .setStyle('LINK')
    .setURL(url);

  const row = new MessageActionRow()
    .addComponents(button);

  if (Marksoft.isReady()) {
    const channel = Marksoft.channels.cache.get(discordChannelId);
    if (channel) {
      channel.send({ embeds: [embed], components: [row] })
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
        //console.log(`Sending naughty message to Discord for Twitch channel: ${channel}`);

        const mappings = JSON.parse(fs.readFileSync(channelMappingsFile, 'utf8')).channelMappings;
        const lowercaseChannelName = channel.toLowerCase();
        const discordChannelId = mappings[lowercaseChannelName];

        if (!discordChannelId) {
            throw new Error(`Discord channel ID not found for Twitch channel: ${channel}`);
        }

        const embed = new MessageEmbed()
            .setTitle(`Twitch Chat`)
            .setDescription(`**${twitchname}** hit the magic number 69!`)
            .setFooter(`Triggered by ${twitchname}`)
            .setThumbnail(`https://i.imgur.com/2yXFtac.png`)
            .setColor('#9146FF');

        if (Marksoft.isReady()) {
            const discordChannel = Marksoft.channels.cache.get(discordChannelId);
            if (discordChannel) {
                discordChannel.send({ embeds: [embed] })
                    .then(message => console.log(`Sent embed: ${message.id}`))
                    .catch(error => console.error(`Error sending embed to Discord: ${error}`));
            } else {
                throw new Error(`Discord channel not found for ID: ${discordChannelId}`);
            }
        } else {
            throw new Error('Discord client not ready.');
        }
    } catch (error) {
        console.error(`Error in sendNaughtyToDiscord: ${error}`);
    }
}

function incrementNaughtyCounter(twitchname) {
  try {
      const filePath = path.join(__dirname, 'naughty_users.json');
      let data = {};

      if (fs.existsSync(filePath)) {
          const fileData = fs.readFileSync(filePath, 'utf8');
          data = JSON.parse(fileData);
      }

      let userFound = false;

      for (const guildId in data) {
          const guildData = data[guildId];
          const guildUsers = guildData.users;

          for (const user of guildUsers) {
              if (user.username === twitchname || (user.twitch && user.twitch === twitchname)) {
                  user.counter += 1;
                  userFound = true;
                  break;
              }
          }
          if (userFound) {
              break;
          }
      }
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      console.log('Naughty counter incremented successfully.');
  } catch (error) {
      console.error('Error incrementing naughty counter:', error);
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
  const guessedNumber = parseInt(args[0]);

  let randomNumber = Math.floor(Math.random() * 70);

  if (twitchname === "marksoftbot") {
    randomNumber = 0;
  } else if (twitchname === "marksoftbot") {
    randomNumber = Math.random() < 0.2 ? 69 : Math.floor(Math.random() * 69);
  } else {
    randomNumber = Math.floor(Math.random() * 70);
  }

  if (cooldowns[twitchname]) return;

  let responseMessage = '';
  
  if (twitchname === "marksoftbot") {
    responseMessage = `${twitchname} is ${randomNumber} out of 69 naughty bankai1Y `;
    logger.info(`${channel} | ${twitchname} is 0 out of 69 naughty bankai1Y`, { label: "Command" });
  } else {
    const guessedCorrectly = !isNaN(guessedNumber) && guessedNumber === randomNumber;
    const hit69 = randomNumber === 69;
    if (guessedCorrectly) {
      if (hit69) {
        responseMessage = `${twitchname} guessed correctly! The number is ${randomNumber} and it's a perfect 69! Congratulations! bankai1Y `;
        logger.info(`${channel} | ${twitchname} guessed correctly and hit 69 🎉`, { label: "Command" });
        sendNaughtyToDiscord(channel, twitchname);
        incrementNaughtyCounter(twitchname);
      } else {
        responseMessage = `${twitchname} guessed correctly! The number is ${randomNumber}. Congratulations! bankai1Y `;
        logger.info(`${channel} | ${twitchname} guessed correctly: ${randomNumber}`, { label: "Command" });
      }
    } else {
      if (hit69) {
        responseMessage = `${twitchname} is ${randomNumber} out of 69 naughty bankai1Y `;
        logger.info(`${channel} | ${twitchname} is ${randomNumber} out of 69 naughty 🎉`, { label: "Command" });
        sendNaughtyToDiscord(channel, twitchname);
        incrementNaughtyCounter(twitchname);
      } else if (randomNumber === 0) {
        responseMessage = `${twitchname} is ${randomNumber} out of 69 naughty bankai1Rip `;
        logger.info(`${channel} | ${twitchname} is ${randomNumber} out of 69 naughty bankai1Rip `, { label: "Command" });
      } else {
        responseMessage = `${twitchname} is ${randomNumber} out of 69 naughty LUL`;
        logger.info(`${channel} | ${twitchname} is ${randomNumber} out of 69 naughty`, { label: "Command" });
      }
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

twitchclient.on('message', async (channel, userstate, message, self) => {
  if (self) return;
  
  const normalizedMessage = message.toLowerCase().trim();
  // eslint-disable-next-line no-useless-escape
  const commandPattern = /^(\!\w+)\b/;
  const match = normalizedMessage.match(commandPattern);

  const isMod = userstate.mod || userstate['user-type'] === 'mod';
  const normalizedChannel = channel.slice(1);

  const clipUrls = message.match(clipUrlRegex);
  if (clipUrls) {
    console.log(`Twitch clip detected: ${clipUrls}`);
    clipUrls.forEach(url => {
      const username = userstate['display-name'];
      sendClipToDiscord(url, username, channel);
    });
  }

  if (!match) return;

  const command = match[1];
  const commandName = commandAliases[command];
  const args = normalizedMessage.slice(command.length).trim().split(/\s+/);

  if (!customCommands[normalizedChannel]) {
    loadCommands(normalizedChannel);
  }
  // !cc (create command) usage: !cc <commandName> <response>
  if (message.startsWith('!cc ') && isMod) {
    const parts = message.split(' ');
    if (parts.length > 2) {
        const commandName = parts[1].toLowerCase();
        const response = parts.slice(2).join(' ');
        createCommand(normalizedChannel, commandName, response);
        twitchclient.say(channel, `Command !${commandName} has been created!`);
    } else {
        twitchclient.say(channel, `Usage: !cc <commandName> <response>`);
    }
    return;
  }

  // !editcmd (edit command) usage: !editcmd <commandName> <newResponse>
  else if (message.startsWith('!ec ') && isMod) {
      const parts = message.split(' ');
      if (parts.length > 2) {
          const commandName = parts[1].toLowerCase();
          const newResponse = parts.slice(2).join(' ');
          if (customCommands[normalizedChannel][commandName]) {
              customCommands[normalizedChannel][commandName] = newResponse;
              saveCommands(normalizedChannel);
              twitchclient.say(channel, `Command !${commandName} has been updated!`);
          } else {
              twitchclient.say(channel, `Command !${commandName} does not exist.`);
          }
      } else {
          twitchclient.say(channel, `Usage: !editcmd <commandName> <newResponse>`);
      }
      return;
  }

  // !delcmd (delete command) usage: !delcmd <commandName>
  else if (message.startsWith('!dc ') && isMod) {
      const parts = message.split(' ');
      if (parts.length === 2) {
          const commandName = parts[1].toLowerCase();
          if (customCommands[normalizedChannel][commandName]) {
              delete customCommands[normalizedChannel][commandName];
              saveCommands(normalizedChannel);
              twitchclient.say(channel, `Command !${commandName} has been deleted!`);
          } else {
              twitchclient.say(channel, `Command !${commandName} does not exist.`);
          }
      } else {
          twitchclient.say(channel, `Usage: !delcmd <commandName>`);
      }
      return;
  }
  // Handle custom commands
  else if (customCommands[normalizedChannel][normalizedMessage]) {
    const response = customCommands[normalizedChannel][normalizedMessage];
    console.log('Responding with:', response); // Debug statement
    twitchclient.say(channel, response);
  }
  else if (command  === '!clip') {
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
  else if (commandName === 'setachievementchannel') {
    handleSetDiscordChannelCommand(channel, userstate, args);
  }
  else if (commandName === 'setclipschannel') {
    handleSetClipsChannelCommand(channel, userstate, args);
  }
  else if (commandName === 'channels') {
    handleChannelsCommand(channel, userstate);
  }
  else if (commandName === 'setlivechannel') {
    handleSetLiveChannelCommand(channel, userstate, args);
  }
  else if (commandName === 'watchtime') {
    handleWatchtimeCommand(channel, userstate, args);
  }
});

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

function onJoinHandler(channel, username, self) {
  if (!self) { // Skip bot itself
  if (!joinTimes[channel]) joinTimes[channel] = {};
    joinTimes[channel][username] = Date.now();
  }
  // const timestamp = moment().format('YYYY-MM-DD HH:mm:ss'); // Format timestamp
  // console.log(`[${timestamp}] ${username} has joined ${channel}`);
}

function onPartHandler(channel, username, self) {
  if (!self) { // Skip bot itself
    updateWatchtime(channel, username);
  }
  // const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
  // console.log(`[${timestamp}] ${username} has left ${channel}`);
}

// Update watch time for a user
function updateWatchtime(channel, username) {
  if (joinTimes[channel] && joinTimes[channel][username]) {
      const currentTime = Date.now();
      const sessionTime = (currentTime - joinTimes[channel][username]) / 1000; // in seconds

      // Ensure channel and user exist in watchtimes object
      if (!watchtimes[channel]) watchtimes[channel] = {};
      if (!watchtimes[channel][username]) watchtimes[channel][username] = 0;

      watchtimes[channel][username] += sessionTime;
      //console.log(`[${channel}] Updated watchtime for ${username}: ${watchtimes[channel][username]} seconds`);

      delete joinTimes[channel][username];
      saveWatchtimes();
  }
}

// Format duration in months, days, hours, minutes, seconds
function formatDuration(seconds) {
  const SEC_IN_MIN = 60;
  const SEC_IN_HOUR = 3600;
  const SEC_IN_DAY = 86400;
  const SEC_IN_MONTH = 2592000;
  const SEC_IN_YEAR = 31536000;

  let years = Math.floor(seconds / SEC_IN_YEAR);
  seconds %= SEC_IN_YEAR;
  let months = Math.floor(seconds / SEC_IN_MONTH);
  seconds %= SEC_IN_MONTH;
  let days = Math.floor(seconds / SEC_IN_DAY);
  seconds %= SEC_IN_DAY;
  let hours = Math.floor(seconds / SEC_IN_HOUR);
  seconds %= SEC_IN_HOUR;
  let minutes = Math.floor(seconds / SEC_IN_MIN);

  let formatted = '';

  if (years > 0) {
      formatted += `${years} year${years !== 1 ? 's' : ''}, `;
  }
  if (months > 0) {
      formatted += `${months} month${months !== 1 ? 's' : ''}, `;
  }
  if (days > 0) {
      formatted += `${days} day${days !== 1 ? 's' : ''}, `;
  }
  if (hours > 0) {
      formatted += `${hours} hour${hours !== 1 ? 's' : ''}, `;
  }
  if (minutes > 0) {
      formatted += `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  if (formatted === '') {
      formatted = 'less than a minute'; // Default if no time accumulated
  }

  return formatted;
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