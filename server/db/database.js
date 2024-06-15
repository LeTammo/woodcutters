const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '/db.sqlite'));

function initialize() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS sessions (
            session_id TEXT PRIMARY KEY,
            trees INTEGER,
            current_round INTEGER
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS rounds (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            round INTEGER,
            orders TEXT,
            total_ordered INTEGER,
            total_felled INTEGER,
            remaining_trees INTEGER,
            new_growth INTEGER,
            order_sequence TEXT
        )`);
    });
}

initialize();

module.exports = db;