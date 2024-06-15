const express = require('express');
const path = require('path');
const fs = require('fs');
const db = require('./db/database');

const router = express();

router.use((req, res, next) => {
    const indexPath = path.join(__dirname, '../client/build', 'index.html');
    if (!fs.existsSync(indexPath)) {
        return res.sendFile(path.join(__dirname, '../client/public', 'updating.html'));
    }
    next();
});

router.get('/session/:sessionId', (req, res) => {
    const sessionId = req.params.sessionId;
    db.all("SELECT * FROM rounds WHERE session_id = ?", [sessionId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

router.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

module.exports = router;