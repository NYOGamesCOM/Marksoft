// notifications.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const channelMappingsFile = './channelMappings.json';

function getDiscordChannelMapping(channel, type) {
    const mappings = JSON.parse(fs.readFileSync(channelMappingsFile, 'utf8'));
    return mappings[type] ? mappings[type][channel] : null;
}

async function sendClipToDiscord(url, username, channel) {
    const discordChannel = getDiscordChannelMapping(channel, 'clipsMappings');
    if (!discordChannel) return;

    try {
        await axios.post(discordChannel, {
            content: `New clip by ${username}: ${url}`,
        });
    } catch (error) {
        console.error(`Failed to send clip to Discord: ${error.message}`);
    }
}

async function sendNaughtyToDiscord(channel, username) {
    const discordChannel = getDiscordChannelMapping(channel, 'channelMappings');
    if (!discordChannel) return;

    try {
        await axios.post(discordChannel, {
            content: `${username} hit a perfect 69!`,
        });
    } catch (error) {
        console.error(`Failed to send naughty message to Discord: ${error.message}`);
    }
}

async function sendLiveNotificationToDiscord(streamer, stream) {
    const discordChannel = getDiscordChannelMapping(`#${streamer.twitchUsername}`, 'liveMappings');
    if (!discordChannel) return;

    try {
        await axios.post(discordChannel, {
            content: `${streamer.twitchUsername} is now live! Watch them at https://www.twitch.tv/${streamer.twitchUsername}`,
        });
    } catch (error) {
        console.error(`Failed to send live notification to Discord: ${error.message}`);
    }
}

module.exports = { sendClipToDiscord, sendNaughtyToDiscord, sendLiveNotificationToDiscord };
