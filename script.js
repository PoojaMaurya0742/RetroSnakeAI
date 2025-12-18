// Main game initialization and control script
let game;
let inputHandler;
let aiManager;
let gameLoop;

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
    setupEventListeners();
    startGameLoop();
});

function initializeGame() {
    try {
        // Create game instance
        game = new SnakeGame('gameCanvas');
        
        // Create input handler for human mode
        inputHandler = new InputHandler(game);
        
        // Create AI manager
        aiManager = new AIManager(game);
        aiManager.start();
        
        console.log('Game initialized successfully');
    } catch (error) {
        console.error('Error initializing game:', error);
    }
}

function setupEventListeners() {
    // Toggle Mode Button
    const toggleBtn = document.getElementById('toggleMode');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            game.toggleMode();
        });
    }
    
    // Pause Button
    const pauseBtn = document.getElementById('pauseGame');
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            game.pause();
        });
    }
    
    // Restart Button
    const restartBtn = document.getElementById('restartGame');
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            game.restart();
        });
    }
}

function startGameLoop() {
    let lastMoveTime = 0;
    const moveInterval = 200; // Move every 200ms
    
    function gameUpdate(currentTime) {
        if (game) {
            // Auto-move the snake at regular intervals
            if (currentTime - lastMoveTime >= moveInterval) {
                if (game.isPlaying && !game.isPaused && !game.gameOver) {
                    if (game.mode === 'human') {
                        // In human mode, move with current direction
                        game.moveSnake();
                    }
                    // AI movement is handled by AIManager
                }
                lastMoveTime = currentTime;
            }
            
            // Render the game
            game.render();
        }
        
        // Continue the loop
        gameLoop = requestAnimationFrame(gameUpdate);
    }
    
    // Start the game loop
    gameLoop = requestAnimationFrame(gameUpdate);
}

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Pause game when tab is not visible
        if (game && game.isPlaying && !game.gameOver) {
            game.pause();
        }
    }
});

// Handle window resize
window.addEventListener('resize', function() {
    if (game) {
        // Re-render on resize
        game.render();
    }
});

// Error handling
window.addEventListener('error', function(e) {
    console.error('Game error:', e.error);
});

// Export for debugging
window.gameDebug = {
    game: () => game,
    ai: () => aiManager,
    restart: () => game && game.restart(),
    toggleMode: () => game && game.toggleMode()
};