/*
const tmi = require('tmi.js');
const { Client, GatewayIntentBits } = require('discord.js');
const { sendClipToDiscord } = require('./sendClipToDiscord');
const { setMapping, removeMapping, getAllMappings, getAllTwitchChannels } = require('./channelMappings');

// Load environment variables
require('dotenv').config();

// Discord client setup
const Marksoft = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

Marksoft.login(process.env.DISCORD_BOT_TOKEN);

const clipUrlRegex = /https:\/\/clips\.twitch\.tv\/[A-Za-z0-9-]+/gi;
const ignoredUsers = ['nightbot', 'bot2', 'bot3']; // List of users to ignore

let twitchClient = null;

function initializeTwitchClient() {
  const twitchChannels = getAllTwitchChannels().map(channel => `#${channel}`);
  if (twitchClient) {
    twitchClient.disconnect();
  }
  twitchClient = new tmi.Client({
    options: { debug: true },
    identity: {
      username: process.env.TWITCH_BOT_USERNAME,
      password: process.env.TWITCH_BOT_OAUTH_TOKEN,
    },
    channels: twitchChannels,
  });

  twitchClient.connect();

  twitchClient.on('message', (channel, userstate, message, self) => {
    if (self) return;
    handleClipUrl(channel, userstate, message);
  });
}

initializeTwitchClient();

function shouldIgnoreUser(username) {
  return ignoredUsers.includes(username.toLowerCase());
}

function handleClipUrl(channel, userstate, message) {
  const { username, 'display-name': displayName } = userstate;

  if (shouldIgnoreUser(username)) {
    console.log(`Ignoring clip from ${username}: ${message}`);
    return;
  }

  const clipUrls = message.match(clipUrlRegex);
  if (clipUrls) {
    clipUrls.forEach(url => {
      sendClipToDiscord(url, displayName, channel.substring(1));
    });
  }
}

Marksoft.on('messageCreate', message => {
  if (message.content.startsWith('!')) {
    handleBotCommands(message);
  }
});

function handleBotCommands(message) {
  const args = message.content.split(' ');
  const command = args[0].toLowerCase();

  if (command === '!setmapping') {
    const twitchChannel = args[1];
    const discordChannelId = args[2];
    if (twitchChannel && discordChannelId) {
      setMapping(twitchChannel, discordChannelId);
      initializeTwitchClient(); // Re-initialize to update Twitch channels
      message.reply(`Mapping set: Twitch channel ${twitchChannel} -> Discord channel ${discordChannelId}`);
    } else {
      message.reply('Usage: !setmapping <twitch_channel> <discord_channel_id>');
    }
  } else if (command === '!removemapping') {
    const twitchChannel = args[1];
    if (twitchChannel) {
      removeMapping(twitchChannel);
      initializeTwitchClient(); // Re-initialize to update Twitch channels
      message.reply(`Mapping removed for Twitch channel: ${twitchChannel}`);
    } else {
      message.reply('Usage: !removemapping <twitch_channel>');
    }
  } else if (command === '!listmappings') {
    const mappings = getAllMappings();
    message.reply(`Current mappings:\n${JSON.stringify(mappings, null, 2)}`);
  }
}
*/