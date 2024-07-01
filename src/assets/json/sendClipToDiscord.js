/*
const { MessageEmbed } = require('discord.js');
const { getMapping } = require('./channelMappings'); // Import dynamic mapping functions

function sendClipToDiscord(url, username, twitchChannel) {
  const discordChannelId = getMapping(twitchChannel);
  if (!discordChannelId) {
    console.error(`No Discord channel mapping found for Twitch channel: ${twitchChannel}`);
    return;
  }

  const embed = new MessageEmbed()
    .setTitle('Twitch Chat Clip')
    .setDescription(`**${username}** shared a clip in the Twitch chat\n\n${url}`)
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

module.exports = { sendClipToDiscord };

*/