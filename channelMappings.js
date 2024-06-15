/*
const fs = require('fs');
const path = require('path');

const mappingsFilePath = path.join(__dirname, 'channelMappings.json');

// Load mappings from file or initialize an empty object
let channelMappings = {};
if (fs.existsSync(mappingsFilePath)) {
  channelMappings = JSON.parse(fs.readFileSync(mappingsFilePath));
}

function saveMappings() {
  fs.writeFileSync(mappingsFilePath, JSON.stringify(channelMappings, null, 2));
}

function setMapping(twitchChannel, discordChannelId) {
  channelMappings[twitchChannel] = discordChannelId;
  saveMappings();
}

function removeMapping(twitchChannel) {
  delete channelMappings[twitchChannel];
  saveMappings();
}

function getMapping(twitchChannel) {
  return channelMappings[twitchChannel];
}

function getAllMappings() {
  return channelMappings;
}

function getAllTwitchChannels() {
  return Object.keys(channelMappings);
}

module.exports = {
  setMapping,
  removeMapping,
  getMapping,
  getAllMappings,
  getAllTwitchChannels
};

*/