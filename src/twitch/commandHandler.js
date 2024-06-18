// commandHandler.js

const twitchClient = require('./twitchClient');
const { sendClipToDiscord, sendNaughtyToDiscord, getBroadcasterId, createTwitchClip, playNextClip } = require('./clipManager');
const { winCounts, saveWinCounts } = require('./winCountManager');
const logger = require("./src/utils/logger");

const cooldowns = {};

const commandAliases = {
    '!naughty': 'naughty',
    '!69': 'naughty',
    '!accountage': 'accountage',
    '!clip': 'clip',
    '!addwin': 'addwin',
    '!resetwins': 'resetwins',
    '!wins': 'wins',
    '!clearwins': 'clearwins'
};

function initializeCommandHandler() {
    twitchClient.connect();

    twitchClient.on('message', async (channel, userstate, message, self) => {
        if (self) return;

        const normalizedMessage = message.toLowerCase().trim();
        const commandPattern = /^(\!\w+)\b/;
        const match = normalizedMessage.match(commandPattern);

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

        if (command === '!clip') {
            handleClipCommand(channel);
        } else if (command === '!addwin') {
            handleAddWinCommand(channel, userstate, args);
        } else if (command === '!clearwins') {
            handleClearWinsCommand(channel);
        } else if (command === '!wins') {
            handleWinsCommand(channel);
        } else if (command === '!resetwins') {
            handleResetWinsCommand(channel);
        } else if (command === '!naughty' || command === '!69') {
            handleNaughtyCommand(channel, userstate);
        } else if (command === '!accountage') {
            handleAccountAgeCommand(channel, userstate, args);
        }
    });
}

async function handleClipCommand(channel) {
    const broadcasterId = await getBroadcasterId(channel);
    const clipUrl = await createTwitchClip(broadcasterId);
    clipQueue.push(clipUrl);
    playNextClip();
}

function handleAddWinCommand(channel, userstate, args) {
    const user = userstate['display-name'];
    const twitchname = args[0];
    const winsToAdd = parseInt(args[1], 10);

    if (isNaN(winsToAdd) || winsToAdd <= 0) {
        twitchClient.say(channel, `${user}, please specify a positive number of wins.`);
        return;
    }

    if (!twitchname) {
        twitchClient.say(channel, `${user}, please specify a username to add wins for.`);
        return;
    }

    if (!winCounts[twitchname]) {
        winCounts[twitchname] = 0;
    }

    winCounts[twitchname] += winsToAdd;
    saveWinCounts();

    twitchClient.say(channel, `${user} added ${winsToAdd} wins to ${twitchname}.`);
    if (winCounts[twitchname] === 69) {
        sendNaughtyToDiscord(twitchname);
    }
}

function handleClearWinsCommand(channel) {
    Object.keys(winCounts).forEach(username => {
        winCounts[username] = 0;
    });
    saveWinCounts();
    twitchClient.say(channel, `All win counts have been cleared.`);
}

function handleWinsCommand(channel) {
    const winList = Object.entries(winCounts)
        .map(([username, wins]) => `${username}: ${wins} wins`)
        .join(', ');
    twitchClient.say(channel, `Current win counts: ${winList}`);
}

function handleResetWinsCommand(channel) {
    winCounts = {};
    saveWinCounts();
    twitchClient.say(channel, `All win counts have been reset.`);
}

function handleNaughtyCommand(channel, userstate) {
    const username = userstate['display-name'];
    twitchClient.say(channel, `${username} has activated the naughty command!`);
    sendNaughtyToDiscord(username);
}

async function handleAccountAgeCommand(channel, userstate, args) {
    const user = userstate['display-name'];
    const username = args[0] || user;

    try {
        const accountData = await getUserAccountAge(username);
        const accountAge = formatAccountAge(accountData);
        twitchClient.say(channel, `${username}'s account age: ${accountAge}`);
    } catch (error) {
        twitchClient.say(channel, `Failed to retrieve account age for ${username}.`);
    }
}

async function getUserAccountAge(username) {
    try {
        const response = await axios.get(
            `https://api.twitch.tv/helix/users?login=${username}`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.TWITCH_ACCESS_TOKEN}`,
                    'Client-Id': process.env.TWITCH_CLIENT_ID
                }
            }
        );

        if (response.data.data.length > 0) {
            return response.data.data[0];
        } else {
            throw new Error('User not found.');
        }
    } catch (error) {
        console.error(`Error fetching account age: ${error.message}`);
        throw new Error('Failed to fetch account age.');
    }
}

function formatAccountAge(accountData) {
    const createdAt = new Date(accountData.created_at);
    const now = new Date();
    const diff = now - createdAt;
    const age = new Date(diff);

    const years = age.getUTCFullYear() - 1970;
    const months = age.getUTCMonth();
    const days = age.getUTCDate() - 1;

    return `${years} years, ${months} months, and ${days} days`;
}

module.exports = {
    initializeCommandHandler
};
