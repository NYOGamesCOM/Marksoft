const fs = require('fs');
const path = require('path');
const mappingsPath = path.join(__dirname, 'channelMappings.json');

function getMapping(twitchChannel) {
    const mappings = getMappings();
    return mappings[twitchChannel.toLowerCase()] || null;
}

function setMapping(twitchChannel, discordChannelId) {
    const mappings = getMappings();
    mappings[twitchChannel.toLowerCase()] = discordChannelId;
    saveMappings(mappings);
}

function removeMapping(twitchChannel) {
    const mappings = getMappings();
    delete mappings[twitchChannel.toLowerCase()];
    saveMappings(mappings);
}

function getMappings() {
    if (fs.existsSync(mappingsPath)) {
        const data = fs.readFileSync(mappingsPath, 'utf-8');
        return JSON.parse(data);
    }
    return {};
}

function saveMappings(mappings) {
    fs.writeFileSync(mappingsPath, JSON.stringify(mappings, null, 2));
}

function getAllTwitchChannels() {
    const mappings = getMappings();
    return Object.keys(mappings);
}

module.exports = {
    getMapping,
    setMapping,
    removeMapping,
    getAllTwitchChannels
};
