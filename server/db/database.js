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

function insertRound(sessionId, round, orders, totalOrdered, totalFelled, remainingTrees, newGrowth, orderSequence, callback) {
    db.run(
        "INSERT INTO rounds (session_id, round, orders, total_ordered, total_felled, remaining_trees, new_growth, order_sequence) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [sessionId, round, orders, totalOrdered, totalFelled, remainingTrees, newGrowth, orderSequence],
        callback
    );
}

module.exports = {
    initialize,
    insertRound
};