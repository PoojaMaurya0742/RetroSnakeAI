# AI Snake Game Design Document

## Overview

The AI Snake Game is a web-based implementation of the classic Snake game enhanced with artificial intelligence capabilities. The system features a modular architecture that cleanly separates game logic, rendering, input handling, and AI components. Players can switch between manual control and AI mode to either play themselves or observe intelligent gameplay.

## Architecture

The system follows a component-based architecture with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Game Engine   │    │   AI Controller │    │   UI Manager    │
│                 │    │                 │    │                 │
│ - Game State    │◄──►│ - Pathfinding   │    │ - Rendering     │
│ - Snake Logic   │    │ - Decision Tree │    │ - Input Handler │
│ - Collision     │    │ - Safety Check  │    │ - Mode Toggle   │
│ - Food System   │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Game Board     │
                    │                 │
                    │ - Grid System   │
                    │ - Coordinates   │
                    │ - Boundaries    │
                    └─────────────────┘
```

## Components and Interfaces

### Game Engine
**Responsibilities:**
- Manage game state (playing, paused, game over)
- Handle snake movement and growth
- Detect collisions (walls, self, food)
- Generate and place food items
- Calculate and track score

**Key Methods:**
- `update()`: Process one game tick
- `moveSnake(direction)`: Move snake in specified direction
- `checkCollisions()`: Detect collision events
- `spawnFood()`: Generate new food at random location
- `reset()`: Initialize new game session

### AI Controller
**Responsibilities:**
- Implement pathfinding algorithms (BFS and greedy)
- Make movement decisions based on game state
- Prioritize safety over food collection when necessary
- Adapt strategy based on snake length and board state

**Key Methods:**
- `calculateNextMove(gameState)`: Determine optimal direction
- `findPathToFood(snake, food, board)`: Use BFS to find safe path
- `evaluateSafety(position, snake)`: Assess move safety
- `getGreedyMove(snake, food)`: Calculate direct approach to food

### UI Manager
**Responsibilities:**
- Render game board and visual elements
- Handle user input (keyboard, mode toggle)
- Display score and game status
- Manage retro visual styling

**Key Methods:**
- `render(gameState)`: Draw current game state
- `handleInput(event)`: Process keyboard input
- `toggleMode()`: Switch between human/AI control
- `updateScore(score)`: Display current score

### Game Board
**Responsibilities:**
- Maintain grid coordinate system
- Define game boundaries
- Provide spatial utilities for pathfinding

**Key Methods:**
- `isValidPosition(x, y)`: Check if coordinates are within bounds
- `getNeighbors(position)`: Return adjacent grid positions
- `isEmpty(position)`: Check if grid cell is unoccupied

## Data Models

### Snake Entity
```javascript
{
  body: [{x: number, y: number}], // Array of segment positions
  direction: string,              // Current movement direction
  length: number,                 // Current snake length
  isGrowing: boolean             // Flag for growth on next update
}
```

### Food Item
```javascript
{
  position: {x: number, y: number}, // Grid coordinates
  value: number                     // Points awarded when consumed
}
```

### Game State
```javascript
{
  snake: Snake,           // Current snake entity
  food: Food,            // Current food item
  score: number,         // Player's current score
  isPlaying: boolean,    // Game active status
  mode: string,          // "human" or "ai"
  board: {width, height} // Grid dimensions
}
```
## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

**Property 1: Input direction mapping**
*For any* valid keyboard input (arrow keys or WASD), the snake should move in the corresponding direction
**Validates: Requirements 1.1**

**Property 2: Food consumption mechanics**
*For any* snake position and food location, when the snake moves into the food position, the snake length should increase by one and a new food item should be generated
**Validates: Requirements 1.2**

**Property 3: Collision detection**
*For any* snake configuration that results in wall or self-collision, the game should transition to game over state
**Validates: Requirements 1.3**

**Property 4: Direction reversal prevention**
*For any* current snake direction, attempting to move in the opposite direction should be ignored and the snake should continue in its current direction
**Validates: Requirements 1.5**

**Property 5: Score increment consistency**
*For any* food consumption event, the score should increase by exactly ten points
**Validates: Requirements 2.1**

**Property 6: Mode switching behavior**
*For any* game state, switching between human and AI modes should disable the previous control method and enable the new one
**Validates: Requirements 3.1, 3.2**

**Property 7: Game reset on mode change**
*For any* active game session, switching control modes should reset the game to initial state
**Validates: Requirements 3.3**

**Property 8: Mode switching availability**
*For any* game state (playing, paused, game over), mode switching should be available and functional
**Validates: Requirements 3.5**

**Property 9: AI pathfinding consistency**
*For any* game state in AI mode, the AI should use pathfinding algorithms to determine the next move toward food
**Validates: Requirements 4.1**

**Property 10: AI safety prioritization**
*For any* board state with multiple paths to food, the AI should choose the path that minimizes collision risk
**Validates: Requirements 4.2**

**Property 11: AI survival behavior**
*For any* game state where no safe path to food exists, the AI should choose moves that avoid immediate collisions
**Validates: Requirements 4.3**

**Property 12: AI path recalculation**
*For any* change in game state (snake growth, new food position), the AI should recalculate its pathfinding strategy
**Validates: Requirements 4.4**

## Error Handling

### Input Validation
- Invalid keyboard inputs are ignored without affecting game state
- Out-of-bounds movements are prevented by collision detection
- Mode switching requests during invalid states are handled gracefully

### AI Error Recovery
- AI pathfinding failures default to safe movement patterns
- Algorithm timeouts trigger fallback to greedy movement
- Invalid AI moves are rejected and recalculated

### Game State Integrity
- Corrupted game states trigger automatic reset
- Invalid snake positions are corrected or cause game over
- Food generation failures retry with different positions

## Testing Strategy

### Dual Testing Approach
The testing strategy employs both unit testing and property-based testing to ensure comprehensive coverage:

- **Unit tests** verify specific examples, edge cases, and error conditions
- **Property tests** verify universal properties that should hold across all inputs
- Together they provide comprehensive coverage: unit tests catch concrete bugs, property tests verify general correctness

### Unit Testing
Unit tests will cover:
- Specific game scenarios (snake eating food at board edges)
- Integration points between game engine and AI controller
- Error conditions and boundary cases
- Mode switching at specific game states

### Property-Based Testing
Property-based testing will use **fast-check** library for JavaScript and will be configured to run a minimum of 100 iterations per test. Each property-based test will:

- Be tagged with comments explicitly referencing the correctness property from this design document
- Use the format: '**Feature: ai-snake-game, Property {number}: {property_text}**'
- Implement exactly one correctness property per test
- Generate random game states to verify universal behaviors

**Property Test Examples:**
- Generate random snake positions and verify collision detection works universally
- Create random board states and verify AI pathfinding consistency
- Test input handling across all possible key combinations
- Verify score calculations across random food consumption sequences

### Test Organization
- Unit tests will be co-located with source files using `.test.js` suffix
- Property-based tests will be organized by component (game engine, AI controller, UI manager)
- Integration tests will verify component interactions
- Performance tests will validate frame rate consistency and AI response times