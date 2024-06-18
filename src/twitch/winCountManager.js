// winCountManager.js

const fs = require('fs');

const WIN_COUNTS_FILE = 'winCounts.json';
let winCounts = {};

if (fs.existsSync(WIN_COUNTS_FILE)) {
    const data = fs.readFileSync(WIN_COUNTS_FILE);
    winCounts = JSON.parse(data);
}

function saveWinCounts() {
    fs.writeFileSync(WIN_COUNTS_FILE, JSON.stringify(winCounts, null, 2));
}

module.exports = {
    winCounts,
    saveWinCounts
};
