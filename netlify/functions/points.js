const fs = require('fs');
const path = require('path');

const pointsFile = path.join(__dirname, '../../points.json');

// Read points from file
function readPoints() {
    return JSON.parse(fs.readFileSync(pointsFile, 'utf8'));
}

// Write points to file
function writePoints(points) {
    fs.writeFileSync(pointsFile, JSON.stringify(points, null, 2));
}

exports.handler = async (event) => {
    const { httpMethod, path } = event;

    // Serve points data
    if (path === '/.netlify/functions/points' && httpMethod === 'GET') {
        try {
            const points = readPoints();
            return {
                statusCode: 200,
                body: JSON.stringify(points),
            };
        } catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to read points.' }),
            };
        }
    }

    // Add point to a house
    if (path === '/.netlify/functions/points' && httpMethod === 'POST') {
        const { house } = JSON.parse(event.body);
        try {
            const points = readPoints();

            if (points[house] !== undefined) {
                points[house]++;
                writePoints(points);
                return {
                    statusCode: 200,
                    body: JSON.stringify({ success: true }),
                };
            } else {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'Invalid house' }),
                };
            }
        } catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to update points.' }),
            };
        }
    }

    // Default response for unsupported paths
    return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Not Found' }),
    };
};
