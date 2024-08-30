// functions/visitorCount.js
const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
    const filePath = path.join(__dirname, 'visitorCount.json');

    try {
        // Read the current visitor count
        let visitorCount = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        // Increment the visitor count
        visitorCount.count++;
        fs.writeFileSync(filePath, JSON.stringify(visitorCount, null, 2));

        return {
            statusCode: 200,
            body: JSON.stringify({ count: visitorCount.count }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to read or write visitor count' }),
        };
    }
};
