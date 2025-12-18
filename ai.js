// AI Controller for Snake Game
class SnakeAI {
    constructor(game) {
        this.game = game;
        this.currentPath = [];
        this.lastGameState = null;
    }
    
    // Main AI decision making method
    calculateNextMove() {
        const gameState = this.game.getGameState();
        
        // Don't move if game is not active
        if (!gameState.isPlaying || gameState.isPaused || gameState.gameOver) {
            return null;
        }
        
        // Recalculate path if game state changed significantly
        if (this.shouldRecalculatePath(gameState)) {
            this.currentPath = this.findPathToFood(gameState);
        }
        
        // Get next move from current path
        let direction = this.getNextMoveFromPath(gameState);
        
        // If no safe path to food, use survival strategy
        if (!direction) {
            direction = this.getSurvivalMove(gameState);
        }
        
        this.lastGameState = gameState;
        return direction;
    }
    
    // Check if we need to recalculate the path
    shouldRecalculatePath(gameState) {
        if (!this.lastGameState) return true;
        
        // Recalculate if food position changed
        if (gameState.food.x !== this.lastGameState.food.x || 
            gameState.food.y !== this.lastGameState.food.y) {
            return true;
        }
        
        // Recalculate if snake grew (ate food)
        if (gameState.snake.length !== this.lastGameState.snake.length) {
            return true;
        }
        
        // Recalculate if current path is empty or blocked
        if (this.currentPath.length === 0) {
            return true;
        }
        
        return false;
    }
    
    // BFS pathfinding to food
    findPathToFood(gameState) {
        const snake = gameState.snake;
        const food = gameState.food;
        const head = snake[0];
        
        // BFS setup
        const queue = [{ position: head, path: [] }];
        const visited = new Set();
        const boardSize = gameState.board.width;
        
        // Add snake body to visited (except tail which will move)
        for (let i = 0; i < snake.length - 1; i++) {
            const segment = snake[i];
            visited.add(`${segment.x},${segment.y}`);
        }
        
        while (queue.length > 0) {
            const { position, path } = queue.shift();
            const posKey = `${position.x},${position.y}`;
            
            // Skip if already visited
            if (visited.has(posKey)) continue;
            visited.add(posKey);
            
            // Found food!
            if (position.x === food.x && position.y === food.y) {
                return path;
            }
            
            // Explore neighbors
            const neighbors = this.getValidNeighbors(position, gameState, path.length);
            for (const neighbor of neighbors) {
                const neighborKey = `${neighbor.x},${neighbor.y}`;
                if (!visited.has(neighborKey)) {
                    const direction = this.getDirectionBetween(position, neighbor);
                    queue.push({
                        position: neighbor,
                        path: [...path, direction]
                    });
                }
            }
        }
        
        return []; // No path found
    }
    
    // Get valid neighboring positions
    getValidNeighbors(position, gameState, pathLength) {
        const neighbors = [];
        const directions = [
            { x: 0, y: -1 }, // up
            { x: 1, y: 0 },  // right
            { x: 0, y: 1 },  // down
            { x: -1, y: 0 }  // left
        ];
        
        for (const dir of directions) {
            const newPos = {
                x: position.x + dir.x,
                y: position.y + dir.y
            };
            
            if (this.isSafePosition(newPos, gameState, pathLength)) {
                neighbors.push(newPos);
            }
        }
        
        return neighbors;
    }
    
    // Check if a position is safe to move to
    isSafePosition(position, gameState, pathLength = 0) {
        const { x, y } = position;
        const boardSize = gameState.board.width;
        
        // Check bounds
        if (x < 0 || x >= boardSize || y < 0 || y >= boardSize) {
            return false;
        }
        
        // Check snake collision (accounting for tail movement)
        const snake = gameState.snake;
        for (let i = 0; i < snake.length - pathLength - 1; i++) {
            const segment = snake[i];
            if (segment.x === x && segment.y === y) {
                return false;
            }
        }
        
        return true;
    }
    
    // Get direction between two adjacent positions
    getDirectionBetween(from, to) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        
        if (dx === 1) return { dx: 1, dy: 0 };      // right
        if (dx === -1) return { dx: -1, dy: 0 };    // left
        if (dy === 1) return { dx: 0, dy: 1 };      // down
        if (dy === -1) return { dx: 0, dy: -1 };    // up
        
        return null;
    }
    
    // Get next move from current path
    getNextMoveFromPath(gameState) {
        if (this.currentPath.length === 0) return null;
        
        const nextDirection = this.currentPath[0];
        
        // Verify the move is still safe
        const head = gameState.snake[0];
        const nextPosition = {
            x: head.x + nextDirection.dx,
            y: head.y + nextDirection.dy
        };
        
        if (this.isSafePosition(nextPosition, gameState)) {
            // Remove the move from path since we're using it
            this.currentPath.shift();
            return nextDirection;
        }
        
        // Path is no longer safe, clear it
        this.currentPath = [];
        return null;
    }
    
    // Survival strategy when no path to food exists
    getSurvivalMove(gameState) {
        const head = gameState.snake[0];
        const possibleMoves = [
            { dx: 0, dy: -1 },  // up
            { dx: 1, dy: 0 },   // right
            { dx: 0, dy: 1 },   // down
            { dx: -1, dy: 0 }   // left
        ];
        
        // Filter out moves that would cause immediate collision
        const safeMoves = possibleMoves.filter(move => {
            const newPos = {
                x: head.x + move.dx,
                y: head.y + move.dy
            };
            return this.isSafePosition(newPos, gameState);
        });
        
        if (safeMoves.length === 0) {
            // No safe moves available
            return null;
        }
        
        // Choose the move that maximizes future space
        let bestMove = safeMoves[0];
        let maxSpace = 0;
        
        for (const move of safeMoves) {
            const newPos = {
                x: head.x + move.dx,
                y: head.y + move.dy
            };
            const availableSpace = this.calculateAvailableSpace(newPos, gameState);
            
            if (availableSpace > maxSpace) {
                maxSpace = availableSpace;
                bestMove = move;
            }
        }
        
        return bestMove;
    }
    
    // Calculate available space from a position using flood fill
    calculateAvailableSpace(startPos, gameState) {
        const visited = new Set();
        const queue = [startPos];
        let spaceCount = 0;
        
        // Add current snake body to visited (except tail)
        const snake = gameState.snake;
        for (let i = 0; i < snake.length - 1; i++) {
            visited.add(`${snake[i].x},${snake[i].y}`);
        }
        
        while (queue.length > 0) {
            const pos = queue.shift();
            const posKey = `${pos.x},${pos.y}`;
            
            if (visited.has(posKey)) continue;
            visited.add(posKey);
            spaceCount++;
            
            // Add valid neighbors to queue
            const neighbors = this.getValidNeighbors(pos, gameState, 0);
            for (const neighbor of neighbors) {
                const neighborKey = `${neighbor.x},${neighbor.y}`;
                if (!visited.has(neighborKey)) {
                    queue.push(neighbor);
                }
            }
        }
        
        return spaceCount;
    }
    
    // Greedy approach as fallback (direct path to food)
    getGreedyMove(gameState) {
        const head = gameState.snake[0];
        const food = gameState.food;
        
        // Calculate distance to food in each direction
        const moves = [
            { dx: 0, dy: -1, dist: Math.abs(head.x - food.x) + Math.abs((head.y - 1) - food.y) },  // up
            { dx: 1, dy: 0, dist: Math.abs((head.x + 1) - food.x) + Math.abs(head.y - food.y) },   // right
            { dx: 0, dy: 1, dist: Math.abs(head.x - food.x) + Math.abs((head.y + 1) - food.y) },   // down
            { dx: -1, dy: 0, dist: Math.abs((head.x - 1) - food.x) + Math.abs(head.y - food.y) }   // left
        ];
        
        // Sort by distance and filter safe moves
        moves.sort((a, b) => a.dist - b.dist);
        
        for (const move of moves) {
            const newPos = {
                x: head.x + move.dx,
                y: head.y + move.dy
            };
            
            if (this.isSafePosition(newPos, gameState)) {
                return { dx: move.dx, dy: move.dy };
            }
        }
        
        return null;
    }
}

// AI Manager to handle AI updates
class AIManager {
    constructor(game) {
        this.game = game;
        this.ai = new SnakeAI(game);
        this.updateInterval = null;
        this.moveDelay = 150; // milliseconds between moves
    }
    
    start() {
        if (this.updateInterval) return;
        
        this.updateInterval = setInterval(() => {
            if (this.game.mode === 'ai') {
                const direction = this.ai.calculateNextMove();
                if (direction) {
                    this.game.moveSnake(direction);
                }
            }
        }, this.moveDelay);
    }
    
    stop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
    
    setSpeed(delay) {
        this.moveDelay = delay;
        if (this.updateInterval) {
            this.stop();
            this.start();
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SnakeAI, AIManager };
}