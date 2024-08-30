// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(express.json());
app.use(cors());  // Allow CORS for all origins

const pointsFile = 'points.json';

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 5 * 1000, // 5 seconds
    max: 1 // Limit each IP to 1 request per windowMs
});
app.use(limiter);

function readPoints() {
    return JSON.parse(fs.readFileSync(pointsFile, 'utf8'));
}

function writePoints(points) {
    fs.writeFileSync(pointsFile, JSON.stringify(points, null, 2));
}

app.get('/points', (req, res) => {
    const points = readPoints();
    res.json(points);
});

app.post('/points', (req, res) => {
    const { house } = req.body;
    const points = readPoints();

    if (points[house] !== undefined) {
        points[house]++;
        writePoints(points);
        res.status(200).json({ success: true });
    } else {
        res.status(400).json({ error: 'Invalid house' });
    }
});

app.get('*', (req, res) => {
    res.status(404).send('Not Found');
});

// Export the app for Vercel
module.exports = app;
