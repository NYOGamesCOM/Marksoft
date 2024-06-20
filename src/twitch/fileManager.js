// fileManager.js
const fs = require('fs');
const axios = require('axios');

const WIN_COUNTS_FILE = 'winCounts.json';

function loadStreamers() {
    try {
        return JSON.parse(fs.readFileSync('./streamers.json', 'utf8')).streamers;
    } catch (err) {
        console.error('Failed to load streamers:', err);
        return [];
    }
}

function saveStreamers(streamers) {
    try {
        fs.writeFileSync('./streamers.json', JSON.stringify({ streamers }, null, 2));
    } catch (err) {
        console.error('Failed to save streamers:', err);
    }
}

async function getBroadcasterId(channel) {
    try {
        const response = await axios.get(`https://api.twitch.tv/helix/users?login=${channel.replace('#', '')}`, {
            headers: {
                'Authorization': `Bearer ${process.env.TWITCH_OAUTH_TOKEN}`,
                'Client-Id': process.env.TWITCH_CLIENT_ID,
            },
        });
        return response.data.data[0].id;
    } catch (error) {
        console.error(`Error getting broadcaster ID for channel ${channel}: ${error.message}`);
        throw error;
    }
}

async function createTwitchClip(broadcasterId) {
    try {
        const response = await axios.post(`https://api.twitch.tv/helix/clips?broadcaster_id=${broadcasterId}`, null, {
            headers: {
                'Authorization': `Bearer ${process.env.TWITCH_OAUTH_TOKEN}`,
                'Client-Id': process.env.TWITCH_CLIENT_ID,
            },
        });
        const clipId = response.data.data[0].id;
        return `https://clips.twitch.tv/${clipId}`;
    } catch (error) {
        console.error(`Error creating clip for broadcaster ${broadcasterId}: ${error.message}`);
        throw error;
    }
}

function saveWinCounts(winCounts) {
    try {
        fs.writeFileSync(WIN_COUNTS_FILE, JSON.stringify(winCounts, null, 2));
    } catch (err) {
        console.error('Failed to save win counts:', err);
    }
}

function shouldIgnoreUser(user) {
    const IGNORE_LIST = JSON.parse(fs.readFileSync('./ignoreList.json', 'utf8')).ignoreList;
    return IGNORE_LIST.includes(user.username);
}

module.exports = { loadStreamers, saveStreamers, getBroadcasterId, createTwitchClip, saveWinCounts, shouldIgnoreUser };
