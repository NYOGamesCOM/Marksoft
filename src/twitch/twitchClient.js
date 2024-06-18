// twitchClient.js

const tmi = require('tmi.js');
require("dotenv").config();

const twitchClient = new tmi.Client({
    connection: {
        reconnect: true,
        secure: true
    },
    identity: {
        username: process.env.TWITCH_BOT_USERNAME,
        password: process.env.TWITCH_OAUTH_TOKEN
    },
    channels: ['13Thomas', 'BanKai'] // Your Twitch channels here
});

module.exports = twitchClient;
