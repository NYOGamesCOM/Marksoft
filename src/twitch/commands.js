// // commands.js
// const { sendClipToDiscord, sendNaughtyToDiscord } = require('./notifications');
// const { saveWinCounts, getBroadcasterId, createTwitchClip, shouldIgnoreUser } = require('./fileManager');

// const commandAliases = {
//     '!naughty': 'naughty',
//     '!69': 'naughty',
//     '!accountage': 'accountage',
//     '!clip': 'clip',
//     '!addwin': 'addwin',
//     '!resetwins': 'resetwins',
//     '!wins': 'wins',
//     '!clearwins': 'clearwins',
//     '!jointo': 'jointo',
//     '!setdiscordchannel': 'setdiscordchannel',
//     '!setclipschannel': 'setclipschannel',
//     '!channels': 'channels',
//     '!setlivechannel': 'setlivechannel'
// };

// let clipRequestCount = 0;
// const clipRequestThreshold = 5;
// const clipRequestTimeout = 5 * 60 * 1000;
// let clipRequestTimer;

// function handleCommand(twitchclient, channel, userstate, message) {
//     const normalizedMessage = message.toLowerCase().trim();
//     const commandPattern = /^(\!\w+)\b/;
//     const match = normalizedMessage.match(commandPattern);

//     const clipUrls = message.match(/https:\/\/clips\.twitch\.tv\/\S+/gi);
//     if (clipUrls) {
//         console.log(`Twitch clip detected: ${clipUrls}`);
//         clipUrls.forEach(url => {
//             const username = userstate['display-name'];
//             sendClipToDiscord(url, username, channel);
//         });
//     }

//     if (!match) return;

//     const command = match[1];
//     const commandName = commandAliases[command];
//     const args = normalizedMessage.slice(command.length).trim().split(/\s+/);

//     switch (commandName) {
//         case 'clip':
//             clipRequestCount++;
//             if (clipRequestCount === 1 || !clipRequestTimer) {
//                 clipRequestTimer = setTimeout(() => {
//                     clipRequestCount = 0;
//                     clearTimeout(clipRequestTimer);
//                     clipRequestTimer = null;
//                 }, clipRequestTimeout);
//             }
//             if (clipRequestCount >= clipRequestThreshold) {
//                 createClip(channel, twitchclient);
//             }
//             break;
//         case 'naughty':
//             handleNaughtyCommand(twitchclient, channel, userstate, args);
//             break;
//         case 'accountage':
//             handleAccountageCommand(twitchclient, channel, userstate, args);
//             break;
//         case 'addwin':
//             handleAddwinCommand(twitchclient, channel, userstate, args);
//             break;
//         case 'resetwins':
//             handleResetwinsCommand(twitchclient, channel, userstate, args);
//             break;
//         case 'wins':
//             handleWinsCommand(twitchclient, channel);
//             break;
//         case 'clearwins':
//             twitchclient.say(channel, `I'm not a dodo bot like @Nightbot :) !resetwins will do the work.`);
//             break;
//         case 'jointo':
//             handleJoinToChannel(twitchclient, channel, userstate, args);
//             break;
//         case 'setdiscordchannel':
//             handleSetDiscordChannelCommand(twitchclient, channel, userstate, args);
//             break;
//         case 'setclipschannel':
//             handleSetClipsChannelCommand(twitchclient, channel, userstate, args);
//             break;
//         case 'channels':
//             handleChannelsCommand(twitchclient, channel, userstate);
//             break;
//         case 'setlivechannel':
//             handleSetLiveChannelCommand(twitchclient, channel, userstate, args);
//             break;
//         default:
//             break;
//     }
// }

// async function createClip(channel, twitchclient) {
//     try {
//         const broadcasterId = await getBroadcasterId(channel);
//         const clipUrl = await createTwitchClip(broadcasterId);
//         twitchclient.say(channel, `Clip created! Watch it here: ${clipUrl}`);
//         clipRequestCount = 0;
//         clearTimeout(clipRequestTimer);
//         clipRequestTimer = null;
//     } catch (error) {
//         twitchclient.say(channel, `Failed to create clip.`);
//         console.error(`Clip creation failed: ${error.message}`);
//         clipRequestCount = 0;
//         clearTimeout(clipRequestTimer);
//         clipRequestTimer = null;
//     }
// }

// function handleNaughtyCommand(twitchclient, channel, userstate, args) {
//     const twitchname = userstate.username;
//     const randomNumber = Math.floor(Math.random() * 70);
//     const guessedNumber = parseInt(args[0]);

//     if (cooldowns[twitchname]) return;

//     let responseMessage = '';

//     const guessedCorrectly = !isNaN(guessedNumber) && guessedNumber === randomNumber;
//     const hit69 = randomNumber === 69;
  
//     if (guessedCorrectly) {
//         if (hit69) {
//             responseMessage = `${twitchname} guessed correctly! The number is ${randomNumber} and it's a perfect 69! Congratulations! bankai1Y `;
//             sendNaughtyToDiscord(channel, twitchname);
//         } else {
//             responseMessage = `${twitchname} guessed correctly! The number is ${randomNumber}. Congratulations! bankai1Y `;
//         }
//     } else {
//         if (hit69) {
//             responseMessage = `${twitchname} is ${randomNumber} out of 69 naughty bankai1Y `;
//             sendNaughtyToDiscord(channel, twitchname);
//         } else {
//             responseMessage = `${twitchname} is ${randomNumber} out of 69 naughty bankai1Y `;
//         }
//     }

//     twitchclient.say(channel, responseMessage);

//     cooldowns[twitchname] = true;
//     setTimeout(() => {
//         delete cooldowns[twitchname];
//     }, 1000 * 60 * 5); // 5 minutes cooldown
// }

// // Other command handlers (handleAccountageCommand, handleAddwinCommand, handleResetwinsCommand, handleWinsCommand, handleJoinToChannel, handleSetDiscordChannelCommand, handleSetClipsChannelCommand, handleChannelsCommand, handleSetLiveChannelCommand) would be similarly structured.

// module.exports = { handleCommand };
