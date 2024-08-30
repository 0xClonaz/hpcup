const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
const pointsFile = 'points.json';

// In-memory store for request timestamps
const requestStore = new Map();

// Rate limit configuration
const RATE_LIMIT_WINDOW_MS = 5000; // 5 seconds
const RATE_LIMIT_MAX_REQUESTS = 1; // 1 request per window

// Load or initialize visitor count data
function loadVisitorData() {
    const data = readPoints();
    if (!data.visitorData || !data.visitorData.visitorCount || !data.visitorData.lastUpdated) {
        data.visitorData = {
            visitorCount: Math.floor(Math.random() * (5000 - 50 + 1)) + 50,
            lastUpdated: Date.now()
        };
        writePoints(data);
    }
    return data.visitorData;
}

// Read points from the file
function readPoints() {
    return JSON.parse(fs.readFileSync(pointsFile, 'utf8'));
}

// Write points (and visitor data) to the file
function writePoints(data) {
    fs.writeFileSync(pointsFile, JSON.stringify(data, null, 2));
}

// Check if the rate limit has been exceeded
function checkRateLimit(ip) {
    const now = Date.now();
    const timestamps = requestStore.get(ip) || [];

    // Remove timestamps outside the window
    while (timestamps.length > 0 && now - timestamps[0] > RATE_LIMIT_WINDOW_MS) {
        timestamps.shift();
    }

    if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
        return false; // Rate limit exceeded
    }

    // Add the current timestamp
    timestamps.push(now);
    requestStore.set(ip, timestamps);
    return true;
}

// Endpoint to serve the main HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint to get points for each house
app.get('/points', (req, res) => {
    const points = readPoints();
    res.json(points);
});

// Endpoint to update points for a specific house
app.post('/points', (req, res) => {
    const { house } = req.body;
    const ip = req.ip;

    if (!checkRateLimit(ip)) {
        res.status(429).json({ error: 'Rate limit exceeded. Please wait and try again.' });
        return;
    }

    const data = readPoints();

    if (data[house] !== undefined) {
        data[house]++;
        writePoints(data);
        res.status(200).json({ success: true });
    } else {
        res.status(400).json({ error: 'Invalid house' });
    }
});

// Endpoint to get the visitor count
app.get('/visitor-count', (req, res) => {
    const data = readPoints();
    const visitorData = data.visitorData;

    // Check if 24 hours have passed since the last update
    if (Date.now() - visitorData.lastUpdated > 24 * 60 * 60 * 1000) {
        visitorData.visitorCount = Math.floor(Math.random() * (5000 - 50 + 1)) + 50;
        visitorData.lastUpdated = Date.now();
        writePoints(data); // Update the file with the new visitor count
    }

    res.json(visitorData);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
