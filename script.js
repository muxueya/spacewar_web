const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
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

// Spaceship object
function createSpaceship() {
    return {
        x: canvas.width / 2,
        y: canvas.height - 100,
        width: 50,
        height: 50,
        speed: 5,
        draw() {
            ctx.fillStyle = 'white';
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
            ctx.fillStyle = 'red';
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
            ctx.fillStyle = this.exploded ? 'orange' : 'green';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        },
        update() {
            this.y += this.speed; // Move enemy down by its speed
        }
    };
}

// Rock object
function createRock() {
    return {
        x: Math.random() * (canvas.width - 40),
        y: Math.random() * (spaceship.y - 80), // Generate y above the spaceship
        width: 40,
        height: 40,
        draw() {
            ctx.fillStyle = 'gray';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    };
}

// Main game loop
function gameLoop() {
    if (gameOver) {
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);
        ctx.font = '24px Arial';
        ctx.fillText(`Score: ${score}`, canvas.width / 2 - 50, canvas.height / 2 + 40);
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

    // Display the score
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);

    requestAnimationFrame(gameLoop);
}

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

// Initialization
spaceship = createSpaceship();
setInterval(() => {
    if (!gameOver) {
        enemies.push(createEnemy());
        rocks.push(createRock());
    }
}, 1000);

gameLoop();