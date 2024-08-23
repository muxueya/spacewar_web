const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScore = document.getElementById('finalScore');
const newGameButton = document.getElementById('newGameButton');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let spaceship;
let bullets = [];
let enemies = [];
let rocks = [];
let keys = {};
let gameOver = false;
let score = 0;  // Initialize score
let enemySpeedIncrement = 0.01; // Speed increment for enemies
let enemySpeed = 2; // Initial speed of enemies
let rockCount = 0; // Number of rocks to generate
let difficultyLevel = 'easy'; // Default difficulty level
let startTime; // Variable to track game start time

// Spaceship object
function createSpaceship() {
    return {
        x: canvas.width / 2,
        y: canvas.height - 100,
        width: 50,
        height: 50,
        speed: 5,
        draw() {
            ctx.fillStyle = 'white'; // Placeholder for spaceship color
            ctx.fillRect(this.x, this.y, this.width, this.height);
        },
        update() {
            if (keys['ArrowLeft'] && this.x > 0) this.x -= this.speed;
            if (keys['ArrowRight'] && this.x < canvas.width - this.width) this.x += this.speed;
        }
    };
}

// Bullet object
function createBullet(x, y) {
    return {
        x: x + 20,
        y: y,
        width: 10,
        height: 20,
        speed: 8,
        draw() {
            ctx.fillStyle = 'red'; // Bullet color
            ctx.fillRect(this.x, this.y, this.width, this.height);
        },
        update() {
            this.y -= this.speed;
        }
    };
}

// Enemy object
function createEnemy() {
    return {
        x: Math.random() * (canvas.width - 50),
        y: -50,
        width: 50,
        height: 50,
        speed: enemySpeed, // Use the current enemy speed
        exploded: false,
        draw() {
            ctx.fillStyle = this.exploded ? 'orange' : 'green'; // Enemy color
            ctx.fillRect(this.x, this.y, this.width, this.height);
        },
        update() {
            this.y += this.speed; // Move enemy down by its speed
        }
    };
}

// Rock object (size reduced to 10%)
function createRock() {
    return {
        x: Math.random() * (canvas.width - 10), // Adjusted width
        y: Math.random() * (spaceship.y - 80), // Generate y above the spaceship
        width: 10, // Adjusted width to 10%
        height: 10, // Adjusted height to 10%
        draw() {
            ctx.fillStyle = 'gray'; // Rock color
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    };
}

// Function to format time in hh:mm:ss:ms
function formatTime(milliseconds) {
    const date = new Date(milliseconds);
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    const ms = String(date.getUTCMilliseconds()).padStart(3, '0');
    return `${hours}:${minutes}:${seconds}:${ms}`;
}

// Main game loop
function gameLoop() {
    if (gameOver) {
        finalScore.innerText = `Score: ${score}`;
        gameOverScreen.classList.remove('hidden'); // Show game over screen
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    spaceship.update();
    spaceship.draw();

    bullets.forEach((bullet, bulletIndex) => {
        bullet.update();
        bullet.draw();
        if (bullet.y < 0) bullets.splice(bulletIndex, 1);

        // Check collision with rocks
        rocks.forEach((rock, rockIndex) => {
            if (bullet.x < rock.x + rock.width &&
                bullet.x + bullet.width > rock.x &&
                bullet.y < rock.y + rock.height &&
                bullet.y + bullet.height > rock.y) {
                bullets.splice(bulletIndex, 1); // Remove bullet on collision
            }
        });

        enemies.forEach((enemy, enemyIndex) => {
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {
                enemy.exploded = true;
                bullets.splice(bulletIndex, 1);
                score++;  // Increase score
                setTimeout(() => enemies.splice(enemyIndex, 1), 100);
            }
        });
    });

    // Gradually increase enemy speed
    enemySpeed += enemySpeedIncrement; // Increase speed over time

    enemies.forEach((enemy, index) => {
        enemy.update();
        enemy.draw();
        if (enemy.y > canvas.height) enemies.splice(index, 1);
        
        // Check collision with spaceship
        if (enemy.x < spaceship.x + spaceship.width &&
            enemy.x + enemy.width > spaceship.x &&
            enemy.y < spaceship.y + spaceship.height &&
            enemy.y + enemy.height > spaceship.y) {
            gameOver = true;
        }
    });

    rocks.forEach(rock => rock.draw());

    // Display the score, speed, and time
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Speed: ${Math.round(enemySpeed * 100) / 100}`, 10, 60); // Display speed

    // Calculate and display elapsed time in hh:mm:ss:ms format
    const elapsedTime = Date.now() - startTime; // Calculate elapsed time
    ctx.fillText(`Time: ${formatTime(elapsedTime)}`, 10, 90); // Display formatted time

    requestAnimationFrame(gameLoop);
}

// Start game function with difficulty settings
function startGame(level) {
    difficultyLevel = level;
    score = 0; // Reset score for new game
    enemySpeed = 2; // Reset enemy speed for new game
    startTime = Date.now(); // Set start time for the new game
    switch (level) {
        case 'easy':
            rockCount = 1; // Fewer rocks for easy mode
            enemySpeedIncrement = 0.002; // Slower speed increase for easy mode
            break;
        case 'medium':
            rockCount = 4; // Moderate rocks
            enemySpeedIncrement = 0.01; // Moderate speed increase
            break;
        case 'hard':
            rockCount = 6; // More rocks
            enemySpeedIncrement = 0.02; // Faster speed increase
            break;
    }
    startScreen.classList.add('hidden'); // Hide start screen
    spaceship = createSpaceship();
    enemies = []; // Ensure enemies are cleared for a new game
    rocks = []; // Ensure rocks are cleared for a new game
    setInterval(() => {
        if (!gameOver) {
            enemies.push(createEnemy());
            for (let i = 0; i < rockCount; i++) {
                rocks.push(createRock());
            }
        }
    }, 1000);
    gameLoop(); // Start the game loop
}

// New game button function to return to start screen
newGameButton.addEventListener('click', () => {
    gameOver = true; // Set game over state to true to show game over screen
    startScreen.classList.remove('hidden'); // Show start screen
    gameOverScreen.classList.add('hidden'); // Hide game over screen
});

// Event listeners
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') {
        bullets.push(createBullet(spaceship.x, spaceship.y));
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Difficulty button click to start game
document.querySelectorAll('.difficultyButton').forEach(button => {
    button.addEventListener('click', (e) => {
        gameOver = false; // Reset game over state
        startGame(e.target.dataset.level); // Start new game with selected difficulty
    });
});

// Initialization (optional)
startScreen.classList.remove('hidden'); // Show start screen