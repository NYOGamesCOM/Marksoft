// clipManager.js

const { MessageEmbed } = require("discord.js");
const axios = require('axios');
const { saveWinCounts, winCounts } = require('./winCountManager');
const Marksoft = require('./discordClient');

const clipUrlRegex = /https:\/\/clips\.twitch\.tv\/\S+/gi;
const discordChannelId = '1251330095101120523';
const NaughtydiscordChannelId = '1249727604051677317';

let clipRequestCount = 0;
const clipRequestThreshold = 5;
const clipRequestTimeout = 5 * 60 * 1000; // 5 minutes
let clipRequestTimer;

let clipQueue = [];
let isPlaying = false;

const OBSWebSocket = require('obs-websocket-js');
const obs = new OBSWebSocket();

function resetClipRequestCounter() {
    clipRequestCount = 0;
    if (clipRequestTimer) {
        clearTimeout(clipRequestTimer);
        clipRequestTimer = null;
    }
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

function sendClipToDiscord(url, username, twitchChannel) {
    const embed = new MessageEmbed()
        .setTitle(`Twitch Chat Clip`)
        .setDescription(`**${username}** shared a clip in **${twitchChannel}** channel\n\n[Watch the clip](${url})`)
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
        .setFooter(`Triggered by ${twitchname}`)
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

async function playNextClip() {
    if (clipQueue.length > 0 && !isPlaying) {
        const nextClip = clipQueue.shift();
        isPlaying = true;

        try {
            await updateBrowserSourceUrl(nextClip);
        } catch (error) {
            console.error('Error playing clip:', error);
        } finally {
            isPlaying = false;
            playNextClip();
        }
    }
}

async function updateBrowserSourceUrl(url) {
    try {
        await obs.connect({ address: 'localhost:4444' }); // Connect to OBS WebSocket (default is localhost:4444)

        // Change 'Twitch Clip Player' to the name of your Browser Source in OBS
        await obs.send('SetSourceSettings', {
            'sourceName': 'Twitch Clip Player',
            'sourceSettings': {
                'url': url // Update the URL of the Browser Source
            }
        });

        console.log(`Browser source updated with URL: ${url}`);
    } catch (error) {
        console.error('Error updating browser source:', error);
    } finally {
        obs.disconnect(); // Disconnect from OBS WebSocket
    }
}

obs.on('error', err => {
    console.error('Socket error:', err);
    obs.disconnect();
});

obs.on('ConnectionClosed', data => {
    console.log('OBS WebSocket connection closed.');
});

module.exports = {
    clipUrlRegex,
    resetClipRequestCounter,
    getBroadcasterId,
    createTwitchClip,
    sendClipToDiscord,
    sendNaughtyToDiscord,
    playNextClip,
    updateBrowserSourceUrl
};
