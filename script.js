const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const dialog = document.getElementById("game-over-dialog");
const retryButton = document.getElementById("retry-button");
const finalScoreElement = document.getElementById("final-score");

// Adjust canvas size for responsiveness
function resizeCanvas() {
  canvas.width = window.innerWidth > 400 ? 400 : window.innerWidth - 20;
  canvas.height = window.innerHeight > 600 ? 600 : window.innerHeight - 20;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Load Images
const birdImg = new Image();
birdImg.src = "https://i.postimg.cc/bJN9Z3Vp/Bird.png";
const pipeSprite = new Image();
pipeSprite.src = "https://i.postimg.cc/pdBBVgZs/Pipe.png";
const bgImg = new Image();
bgImg.src = "https://i.postimg.cc/VNwR8YjS/Background.png";

let bird = {
  x: canvas.width / 4,
  y: canvas.height / 2,
  width: 40,
  height: 30,
  dy: 0,
  gravity: 0.3, // Reduced gravity for easier control
  jump: -8, // Increased jump height
};

let pipes = [];
let pipeWidth = 50;
let pipeGap = 200; // Wider gap between pipes
let pipeFrequency = 100; // Fewer pipes for easier play
let pipeSpeed = 2; // Increased speed for a more challenging game
let frameCount = 0;
let score = 0;
let gameOver = false;
let gameStarted = false;
let startScreenActive = true;

// Event Listeners
document.addEventListener("keydown", () => {
  if (gameStarted && !gameOver) bird.dy = bird.jump;
});

canvas.addEventListener("click", () => {
  if (startScreenActive) {
    startScreenActive = false;
    gameStarted = true;
    startGame();
  } else if (!gameOver) {
    bird.dy = bird.jump;
  }
});

retryButton.addEventListener("click", resetGame);

// Generate Pipes
function createPipe() {
  const pipeTopHeight = Math.floor(Math.random() * (canvas.height - pipeGap - 100)) + 50;
  const pipeBottomY = pipeTopHeight + pipeGap;
  pipes.push({
    x: canvas.width,
    top: pipeTopHeight,
    bottom: pipeBottomY,
  });
}

// Check Collision
function isCollision(pipe) {
  if (
    bird.x < pipe.x + pipeWidth &&
    bird.x + bird.width > pipe.x &&
    (bird.y < pipe.top || bird.y + bird.height > pipe.bottom)
  ) {
    return true;
  }
  if (bird.y + bird.height >= canvas.height || bird.y <= 0) return true;
  return false;
}

// Draw the initial screen with "Start the Game" message
function drawStartScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
  ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.fillRect(canvas.width / 4, canvas.height / 3, canvas.width / 2, 50);

  ctx.fillStyle = "#FF5733";
  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Start the Game", canvas.width / 2, canvas.height / 3 + 30);

  if (startScreenActive) {
    requestAnimationFrame(drawStartScreen);
  }
}

// Game Loop
function update() {
  if (gameOver || !gameStarted) return;

  // Background
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  // Update Bird
  bird.dy += bird.gravity;
  bird.y += bird.dy;
  ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

  // Create New Pipes
  frameCount++;
  if (frameCount % pipeFrequency === 0) createPipe();

  // Update and Draw Pipes
  pipes.forEach((pipe, index) => {
    pipe.x -= pipeSpeed; // Increased pipe speed for more challenge

    // Draw the top pipe
    ctx.drawImage(
      pipeSprite,
      0,
      0,
      pipeSprite.width,
      pipeSprite.height / 2,
      pipe.x,
      pipe.top - pipeSprite.height / 2,
      pipeWidth,
      pipeSprite.height / 2
    );

    // Draw the bottom pipe
    ctx.drawImage(
      pipeSprite,
      0,
      pipeSprite.height / 2,
      pipeSprite.width,
      pipeSprite.height / 2,
      pipe.x,
      pipe.bottom,
      pipeWidth,
      pipeSprite.height / 2
    );

    // Remove off-screen pipes
    if (pipe.x + pipeWidth < 0) pipes.splice(index, 1);

    // Increment score when the bird passes the pipe
    if (pipe.x + pipeWidth < bird.x && !pipe.passed) {
      score++;
      pipe.passed = true; // Mark the pipe as passed
    }
  });

  // Draw Scoreboard
  ctx.fillStyle = "#FFA500";
  ctx.font = "24px Arial";
  ctx.fillText(`Score: ${score}`, canvas.width - 100, 30);

  // Check for Collisions
  for (const pipe of pipes) {
    if (isCollision(pipe)) {
      endGame();
      return;
    }
  }

  requestAnimationFrame(update);
}

// Start Game
function startGame() {
  update();
}

// End Game
function endGame() {
  gameOver = true;
  finalScoreElement.textContent = score;
  dialog.classList.remove("hidden");
}

// Reset Game
function resetGame() {
  bird.y = canvas.height / 2;
  bird.dy = 0;
  pipes = [];
  score = 0;
  frameCount = 0;
  gameOver = false;
  gameStarted = false;
  startScreenActive = true;
  dialog.classList.add("hidden");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawStartScreen();
}

// Initialize the game
drawStartScreen();
