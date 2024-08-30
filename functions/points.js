// functions/points.js
const fs = require('fs');
const path = require('path');

const pointsFile = path.join(__dirname, 'points.json');

exports.handler = async function(event, context) {
    if (event.httpMethod === 'GET') {
        try {
            const points = JSON.parse(fs.readFileSync(pointsFile, 'utf8'));
            return {
                statusCode: 200,
                body: JSON.stringify(points),
            };
        } catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to read points' }),
            };
        }
    } else if (event.httpMethod === 'POST') {
        const { house } = JSON.parse(event.body);
        if (!house) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid house' }),
            };
        }

        try {
            const points = JSON.parse(fs.readFileSync(pointsFile, 'utf8'));
            if (points[house] !== undefined) {
                points[house]++;
                fs.writeFileSync(pointsFile, JSON.stringify(points, null, 2));
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
                body: JSON.stringify({ error: 'Failed to update points' }),
            };
        }
    } else {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }
};
