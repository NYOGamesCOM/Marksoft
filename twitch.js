const tmi = require('tmi.js');

const twitchclient = new tmi.Client({
    options: {debug: true},
    connection:{
        reconnect: true,
        secure: true
    },
    identify:{
        username: process.env.TWITCH_BOT_USERNAME,
        password: process.env.TWITCH_OAUTH_TOKEN
    },
    channels: ['13Thomas']
});

twitchclient.connect();
twitchclient.on('message', (channel, userstate, message, self) => {
    if(self) return;
    if(message.toLowerCase() === '!hello') {
        twitchclient.say(channel, `@${userstate.username}, World`);
    }
});