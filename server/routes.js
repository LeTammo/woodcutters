const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express();

router.use((req, res, next) => {
    const indexPath = path.join(__dirname, '../client/build', 'index.html');
    if (!fs.existsSync(indexPath)) {
        return res.sendFile(path.join(__dirname, '../client/public', 'updating.html'));
    }
    next();
});

router.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

module.exports = router;