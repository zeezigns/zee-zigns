const path = require('path');
const fs = require('fs');

// Simple JSON file based database since native SQLite builds are failing
const dbPath = path.resolve(__dirname, 'aaburgers.json');

// Initialize database file
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({
    accounts: [],
    orders: []
  }, null, 2));
}

const db = {
  read: () => JSON.parse(fs.readFileSync(dbPath, 'utf8')),
  write: (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
};

console.log('Database initialized.');

module.exports = db;
