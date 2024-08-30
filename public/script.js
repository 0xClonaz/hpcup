const apiUrl = 'https://66d10f2e845bc5d02ad3bffd--luxury-tiramisu-0ebaa2.netlify.app';
let currentToken = '';

async function fetchVisitorCount() {
    try {
        const response = await fetch('/.netlify/functions/visitorCount');
        const data = await response.json();
        document.getElementById('visitor-count').innerText = `Visitors in the last 24 hours: ${data.count}`;
    } catch (error) {
        console.error('Error fetching visitor count:', error);
    }
}

fetchVisitorCount();



// Fetch and display points
async function getPoints() {
    try {
        const response = await fetch('/.netlify/functions/points');
        if (!response.ok) throw new Error('Network response was not ok.');
        const data = await response.json();
        updatePointsUI(data);
        updateProgressBar(data);
    } catch (error) {
        console.error('Error fetching points:', error);
    }
}

function updatePointsUI(points) {
    document.getElementById('gryffindor-points').innerText = `Points: ${points.gryffindor}`;
    document.getElementById('hufflepuff-points').innerText = `Points: ${points.hufflepuff}`;
    document.getElementById('ravenclaw-points').innerText = `Points: ${points.ravenclaw}`;
    document.getElementById('slytherin-points').innerText = `Points: ${points.slytherin}`;
}

// Update the progress bar percentages for each house
function updateProgressBar(points) {
    const totalPoints = points.gryffindor + points.hufflepuff + points.ravenclaw + points.slytherin;

    if (totalPoints === 0) return;

    const gryffindorWidth = (points.gryffindor / totalPoints) * 100;
    const hufflepuffWidth = (points.hufflepuff / totalPoints) * 100;
    const ravenclawWidth = (points.ravenclaw / totalPoints) * 100;
    const slytherinWidth = (points.slytherin / totalPoints) * 100;

    document.getElementById('gryffindor-segment').style.width = `${gryffindorWidth}%`;
    document.getElementById('hufflepuff-segment').style.width = `${hufflepuffWidth}%`;
    document.getElementById('ravenclaw-segment').style.width = `${ravenclawWidth}%`;
    document.getElementById('slytherin-segment').style.width = `${slytherinWidth}%`;

    document.getElementById('gryffindor-percent').innerText = `${Math.round(gryffindorWidth)}%`;
    document.getElementById('hufflepuff-percent').innerText = `${Math.round(hufflepuffWidth)}%`;
    document.getElementById('ravenclaw-percent').innerText = `${Math.round(ravenclawWidth)}%`;
    document.getElementById('slytherin-percent').innerText = `${Math.round(slytherinWidth)}%`;
}

// Add a point to the selected house
async function addPoint(house) {
    const button = document.querySelector(`.${house} button`);
    button.disabled = true;
    const cooldownTime = 5; // Cooldown time in seconds

    try {
        const response = await fetch('/.netlify/functions/points', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ house })
        });

        if (response.status === 429) {
            alert('Rate limit exceeded. Please wait and try again.');
        } else if (!response.ok) {
            throw new Error('Network response was not ok.');
        } else {
            const data = await response.json();
            if (data.success) {
                getPoints();
            } else {
                console.error('Error adding point:', data.message || 'Unknown error');
            }
        }
    } catch (error) {
        console.error('Error adding point:', error);
    }

    // Start cooldown countdown
    let timeLeft = cooldownTime;
    button.innerText = `You can give points again in ${timeLeft} sec.`;

    const countdown = setInterval(() => {
        timeLeft--;
        if (timeLeft > 0) {
            button.innerText = `You can give points again in ${timeLeft} sec.`;
        } else {
            clearInterval(countdown);
            button.disabled = false;
            button.innerText = `1 Point to ${house.charAt(0).toUpperCase() + house.slice(1)}!`;
        }
    }, 1000);
}


// Fetch points when the page loads
getPoints();

// Update visitor count by fetching from the server
async function updateVisitorCount() {
    try {
        const response = await fetch(`${apiUrl}/visitor-count`);
        if (!response.ok) throw new Error('Network response was not ok.');
        const data = await response.json();
        document.getElementById('visitor-count').innerText = `Visitors in the last 24 hours: ${data.visitorCount}`;
    } catch (error) {
        console.error('Error fetching visitor count:', error);
    }
}

// Fetch the visitor count initially
updateVisitorCount();
