// Core Snake Game Engine
class SnakeGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Game configuration
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        // Game state
        this.snake = [];
        this.food = {};
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.mode = 'human'; // 'human' or 'ai'
        this.gameOver = false;
        
        this.init();
    }
    
    init() {
        // Initialize snake at center
        this.snake = [
            { x: Math.floor(this.tileCount / 2), y: Math.floor(this.tileCount / 2) }
        ];
        
        // Initial direction (moving right)
        this.dx = 1;
        this.dy = 0;
        
        // Generate first food
        this.generateFood();
        
        // Reset game state
        this.score = 0;
        this.isPlaying = true;
        this.isPaused = false;
        this.gameOver = false;
        
        this.updateScore();
    }
    
    generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.isSnakePosition(newFood.x, newFood.y));
        
        this.food = newFood;
    }
    
    isSnakePosition(x, y) {
        return this.snake.some(segment => segment.x === x && segment.y === y);
    }
    
    moveSnake(direction = null) {
        if (!this.isPlaying || this.isPaused || this.gameOver) return;
        
        // Use provided direction or current direction
        let newDx = direction ? direction.dx : this.dx;
        let newDy = direction ? direction.dy : this.dy;
        
        // Prevent reversing into itself (only if snake has more than 1 segment)
        if (this.snake.length > 1) {
            if (newDx === -this.dx && newDy === -this.dy) {
                newDx = this.dx;
                newDy = this.dy;
            }
        }
        
        this.dx = newDx;
        this.dy = newDy;
        
        // Calculate new head position
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
        
        // Check collisions before moving
        if (this.checkCollisions(head)) {
            this.endGame();
            return;
        }
        
        // Add new head
        this.snake.unshift(head);
        
        // Check food consumption
        if (head.x === this.food.x && head.y === this.food.y) {
            this.consumeFood();
        } else {
            // Remove tail if no food consumed
            this.snake.pop();
        }
    }
    
    checkCollisions(position) {
        // Wall collision
        if (position.x < 0 || position.x >= this.tileCount || 
            position.y < 0 || position.y >= this.tileCount) {
            return true;
        }
        
        // Self collision
        return this.snake.some(segment => 
            segment.x === position.x && segment.y === position.y
        );
    }
    
    consumeFood() {
        this.score += 10;
        this.updateScore();
        this.generateFood();
    }
    
    updateScore() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
    }
    
    endGame() {
        this.gameOver = true;
        this.isPlaying = false;
        
        const messageElement = document.getElementById('gameMessage');
        if (messageElement) {
            messageElement.textContent = `Game Over! Final Score: ${this.score}`;
        }
    }
    
    pause() {
        if (!this.gameOver) {
            this.isPaused = !this.isPaused;
            
            const pauseBtn = document.getElementById('pauseGame');
            if (pauseBtn) {
                pauseBtn.textContent = this.isPaused ? 'RESUME' : 'PAUSE';
            }
        }
    }
    
    restart() {
        // Clear any existing game message
        const messageElement = document.getElementById('gameMessage');
        if (messageElement) {
            messageElement.textContent = '';
        }
        
        // Reset pause button text
        const pauseBtn = document.getElementById('pauseGame');
        if (pauseBtn) {
            pauseBtn.textContent = 'PAUSE';
        }
        
        this.init();
    }
    
    setMode(newMode) {
        if (newMode === 'human' || newMode === 'ai') {
            this.mode = newMode;
            
            // Update mode display
            const modeElement = document.getElementById('mode');
            if (modeElement) {
                modeElement.textContent = newMode.toUpperCase();
            }
            
            // Update toggle button text
            const toggleBtn = document.getElementById('toggleMode');
            if (toggleBtn) {
                toggleBtn.textContent = newMode === 'human' ? 'SWITCH TO AI' : 'SWITCH TO HUMAN';
            }
            
            // Restart game when switching modes
            this.restart();
        }
    }
    
    toggleMode() {
        const newMode = this.mode === 'human' ? 'ai' : 'human';
        this.setMode(newMode);
    }
    
    // Get current game state for AI
    getGameState() {
        return {
            snake: [...this.snake],
            food: { ...this.food },
            score: this.score,
            isPlaying: this.isPlaying,
            isPaused: this.isPaused,
            gameOver: this.gameOver,
            mode: this.mode,
            board: {
                width: this.tileCount,
                height: this.tileCount
            },
            gridSize: this.gridSize
        };
    }
    
    // Check if a position is valid (within bounds and not on snake)
    isValidPosition(x, y) {
        if (x < 0 || x >= this.tileCount || y < 0 || y >= this.tileCount) {
            return false;
        }
        return !this.isSnakePosition(x, y);
    }
    
    // Get neighboring positions for pathfinding
    getNeighbors(position) {
        const neighbors = [];
        const directions = [
            { x: 0, y: -1 }, // up
            { x: 1, y: 0 },  // right
            { x: 0, y: 1 },  // down
            { x: -1, y: 0 }  // left
        ];
        
        directions.forEach(dir => {
            const newPos = {
                x: position.x + dir.x,
                y: position.y + dir.y
            };
            
            if (this.isValidPosition(newPos.x, newPos.y)) {
                neighbors.push(newPos);
            }
        });
        
        return neighbors;
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.drawGrid();
        
        // Draw snake
        this.drawSnake();
        
        // Draw food
        this.drawFood();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    drawSnake() {
        this.snake.forEach((segment, index) => {
            // Head is brighter green, body is darker
            this.ctx.fillStyle = index === 0 ? '#00ff00' : '#00cc00';
            this.ctx.fillRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });
    }
    
    drawFood() {
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(
            this.food.x * this.gridSize + 1,
            this.food.y * this.gridSize + 1,
            this.gridSize - 2,
            this.gridSize - 2
        );
    }
}

// Input handler for human mode
class InputHandler {
    constructor(game) {
        this.game = game;
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (this.game.mode !== 'human') return;
            
            const direction = this.getDirectionFromKey(e.key);
            if (direction) {
                e.preventDefault();
                // Prevent reversing into itself (only if snake has more than 1 segment)
                if (this.game.snake.length > 1) {
                    if (direction.dx === -this.game.dx && direction.dy === -this.game.dy) {
                        return; // Ignore reverse direction
                    }
                }
                // Set new direction
                this.game.dx = direction.dx;
                this.game.dy = direction.dy;
            }
            
            // Handle other keys
            switch (e.key) {
                case ' ':
                    e.preventDefault();
                    this.game.toggleMode();
                    break;
                case 'p':
                case 'P':
                    e.preventDefault();
                    this.game.pause();
                    break;
                case 'r':
                case 'R':
                    e.preventDefault();
                    this.game.restart();
                    break;
            }
        });
    }
    
    getDirectionFromKey(key) {
        const directions = {
            'ArrowUp': { dx: 0, dy: -1 },
            'ArrowDown': { dx: 0, dy: 1 },
            'ArrowLeft': { dx: -1, dy: 0 },
            'ArrowRight': { dx: 1, dy: 0 },
            'w': { dx: 0, dy: -1 },
            'W': { dx: 0, dy: -1 },
            's': { dx: 0, dy: 1 },
            'S': { dx: 0, dy: 1 },
            'a': { dx: -1, dy: 0 },
            'A': { dx: -1, dy: 0 },
            'd': { dx: 1, dy: 0 },
            'D': { dx: 1, dy: 0 }
        };
        
        return directions[key] || null;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SnakeGame, InputHandler };
}