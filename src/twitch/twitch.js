// // twitch.js
// require('dotenv').config();
// const tmi = require('tmi.js');
// const axios = require('axios');
// const fs = require('fs');
// const path = require('path');
// const { sendClipToDiscord, sendNaughtyToDiscord } = require('./notifications');
// const { handleCommand } = require('./commands');
// const { loadStreamers, saveStreamers } = require('./fileManager');

// const WIN_COUNTS_FILE = 'winCounts.json';
// const clipsMappingsFile = './clipsMappings.json';
// const channelMappingsFile = './channelMappings.json';

// let winCounts = fs.existsSync(WIN_COUNTS_FILE) ? JSON.parse(fs.readFileSync(WIN_COUNTS_FILE)) : {};
// let clipsMappings = fs.existsSync(clipsMappingsFile) ? JSON.parse(fs.readFileSync(clipsMappingsFile, 'utf8')).clipsMappings : {};
// let liveStatus = {};
// let cooldowns = {};

// const twitchclient = new tmi.Client({
//     connection: {
//         reconnect: true,
//         secure: true
//     },
//     identity: {
//         username: process.env.TWITCH_BOT_USERNAME,
//         password: process.env.TWITCH_OAUTH_TOKEN
//     },
//     channels: JSON.parse(fs.readFileSync('./channels.json', 'utf8')).channels
// });

// const streamers = loadStreamers();

// twitchclient.on('message', async (channel, userstate, message, self) => {
//     if (self) return;
//     handleCommand(twitchclient, channel, userstate, message);
// });

// twitchclient.on('join', onJoinHandler);
// twitchclient.on('part', onPartHandler);

// twitchclient.connect().then(() => {
//     console.log(`[${new Date().toISOString()}] Bot connected to Twitch.`);
//     twitchclient.getChannels().forEach(channel => {
//         console.log(`[${new Date().toISOString()}] Joined channel ${channel}.`);
//     });
// }).catch(err => {
//     console.error(`Error connecting to Twitch: ${err}`);
// });

// function onJoinHandler(channel, username, self) {
//     if (self) return;
//     console.log(`[${new Date().toISOString()}] ${username} has joined ${channel}`);
// }

// function onPartHandler(channel, username, self) {
//     if (self) return;
//     console.log(`[${new Date().toISOString()}] ${username} has left ${channel}`);
// }

// async function checkStreamerLiveStatus(streamer) {
//     try {
//         const response = await axios.get(
//             `https://api.twitch.tv/helix/streams?user_login=${streamer.twitchUsername}`,
//             {
//                 headers: {
//                     'Authorization': `Bearer ${process.env.TWITCH_OAUTH_TOKEN}`,
//                     'Client-Id': process.env.TWITCH_CLIENT_ID,
//                 },
//             }
//         );

//         const stream = response.data.data[0];
//         const isLive = !!stream;
//         if (isLive && !liveStatus[streamer.twitchUsername]) {
//             console.log(`${streamer.twitchUsername} is live!`);
//             liveStatus[streamer.twitchUsername] = true;
//             sendLiveNotificationToDiscord(streamer, stream);
//         } else if (!isLive && liveStatus[streamer.twitchUsername]) {
//             console.log(`${streamer.twitchUsername} is no longer live.`);
//             liveStatus[streamer.twitchUsername] = false;
//         }
//     } catch (error) {
//         console.error(`Error fetching live status for ${streamer.twitchUsername}: ${error.message}`);
//     }
// }

// setInterval(() => {
//     streamers.forEach(checkStreamerLiveStatus);
// }, 60 * 1000);

// module.exports = { twitchclient, checkStreamerLiveStatus };
