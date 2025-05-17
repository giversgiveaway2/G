import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Game.scss';

// Main Game Component
const Game = () => {
  const navigate = useNavigate();
  const [currentGame, setCurrentGame] = useState(null); // null, 'shooter', or 'snake'
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // Go back to home
  const goToHome = () => {
    navigate('/');
  };

  // Go back to game selection
  const goToGameSelection = () => {
    setCurrentGame(null);
    setGameActive(false);
    setGameOver(false);
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>G-Platform Mini Games</h1>
        {gameActive && (
          <div className="game-stats">
            <div className="stat-item">Score: {score}</div>
            <div className="stat-item">Time: {timeLeft}s</div>
          </div>
        )}
      </div>

      {!currentGame && !gameActive && !gameOver && (
        <div className="game-selection">
          <h2>Choose Your Game</h2>
          
          <div className="game-options">
            <div className="game-option" onClick={() => setCurrentGame('shooter')}>
              <h3>Space Shooter</h3>
              <p>Pilot your spaceship through waves of alien enemies!</p>
              <div className="game-preview shooter-preview"></div>
            </div>
            
            <div className="game-option" onClick={() => setCurrentGame('snake')}>
              <h3>Space Snake</h3>
              <p>Guide your energy snake to collect cubes while avoiding enemies!</p>
              <div className="game-preview snake-preview"></div>
            </div>
          </div>
          
          <button className="home-button" onClick={goToHome}>Back to Home</button>
        </div>
      )}

      {currentGame === 'shooter' && (
        <SpaceShooterGame 
          score={score}
          setScore={setScore}
          timeLeft={timeLeft}
          setTimeLeft={setTimeLeft}
          gameActive={gameActive}
          setGameActive={setGameActive}
          gameOver={gameOver}
          setGameOver={setGameOver}
          goToGameSelection={goToGameSelection}
          goToHome={goToHome}
        />
      )}

      {currentGame === 'snake' && (
        <SnakeGame 
          score={score}
          setScore={setScore}
          timeLeft={timeLeft}
          setTimeLeft={setTimeLeft}
          gameActive={gameActive}
          setGameActive={setGameActive}
          gameOver={gameOver}
          setGameOver={setGameOver}
          goToGameSelection={goToGameSelection}
          goToHome={goToHome}
        />
      )}
    </div>
  );
};

// Space Shooter Game Component
const SpaceShooterGame = ({ 
  score, setScore, 
  timeLeft, setTimeLeft, 
  gameActive, setGameActive, 
  gameOver, setGameOver, 
  goToGameSelection, goToHome 
}) => {
  const gameAreaRef = useRef(null);
  const playerRef = useRef(null);
  const [enemies, setEnemies] = useState([]);
  const [lasers, setLasers] = useState([]);
  const [playerPosition, setPlayerPosition] = useState({ x: 50, y: 85 });
  const [gameLoopId, setGameLoopId] = useState(null);
  const [enemySpawnId, setEnemySpawnId] = useState(null);
  
  // Start the game
  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameActive(true);
    setGameOver(false);
    setEnemies([]);
    setLasers([]);
    setPlayerPosition({ x: 50, y: 85 });
    
    // Set up game loop
    const loopId = setInterval(() => {
      updateGameState();
    }, 50);
    setGameLoopId(loopId);
    
    // Set up enemy spawning
    const spawnId = setInterval(() => {
      spawnEnemy();
    }, 1000);
    setEnemySpawnId(spawnId);
  };
  
  // Update game state (move elements, check collisions)
  const updateGameState = () => {
    // Move lasers
    setLasers(prevLasers => {
      return prevLasers
        .map(laser => ({
          ...laser,
          y: laser.y - 2 // Move up
        }))
        .filter(laser => laser.y > -5); // Remove lasers that go off screen
    });
    
    // Move enemies
    setEnemies(prevEnemies => {
      return prevEnemies
        .map(enemy => ({
          ...enemy,
          y: enemy.y + enemy.speed // Move down
        }))
        .filter(enemy => {
          // Remove enemies that go off screen
          if (enemy.y > 100) {
            return false;
          }
          return true;
        });
    });
    
    // Check for collisions between lasers and enemies
    checkCollisions();
  };
  
  // Spawn a new enemy
  const spawnEnemy = () => {
    const enemyTypes = ['pirate', 'ufo', 'bat'];
    const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    const newEnemy = {
      id: Date.now(),
      x: Math.random() * 90 + 5,
      y: -10,
      width: 40,
      height: 40,
      speed: Math.random() * 1 + 0.5,
      type
    };
    
    setEnemies(prevEnemies => [...prevEnemies, newEnemy]);
  };
  
  // Fire a laser
  const fireLaser = () => {
    const newLaser = {
      id: Date.now(),
      x: playerPosition.x,
      y: playerPosition.y - 5,
      width: 3,
      height: 15
    };
    
    setLasers(prevLasers => [...prevLasers, newLaser]);
  };
  
  // Check for collisions between lasers and enemies
  const checkCollisions = () => {
    let scoreIncrease = 0;
    
    const updatedLasers = [...lasers];
    const updatedEnemies = [...enemies];
    
    // Check each laser against each enemy
    for (let i = updatedLasers.length - 1; i >= 0; i--) {
      const laser = updatedLasers[i];
      
      for (let j = updatedEnemies.length - 1; j >= 0; j--) {
        const enemy = updatedEnemies[j];
        
        // Check if laser and enemy overlap
        if (
          laser.x + 1.5 >= enemy.x - enemy.width/2 &&
          laser.x - 1.5 <= enemy.x + enemy.width/2 &&
          laser.y <= enemy.y + enemy.height/2 &&
          laser.y >= enemy.y - enemy.height/2
        ) {
          // Collision detected
          updatedLasers.splice(i, 1);
          updatedEnemies.splice(j, 1);
          scoreIncrease += 10;
          break;
        }
      }
    }
    
    if (scoreIncrease > 0) {
      setScore(prevScore => prevScore + scoreIncrease);
    }
    
    setLasers(updatedLasers);
    setEnemies(updatedEnemies);
  };
  
  // Handle mouse movement to control the player
  const handleMouseMove = (e) => {
    if (!gameAreaRef.current || !gameActive) return;
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    
    setPlayerPosition(prev => ({
      ...prev,
      x: Math.max(5, Math.min(95, x))
    }));
  };
  
  // Handle click to fire laser
  const handleClick = () => {
    if (gameActive) {
      fireLaser();
    }
  };
  
  // Timer effect
  useEffect(() => {
    if (!gameActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setGameActive(false);
          setGameOver(true);
          
          // Clear game loops
          if (gameLoopId) clearInterval(gameLoopId);
          if (enemySpawnId) clearInterval(enemySpawnId);
          
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameActive, gameLoopId, enemySpawnId, setGameActive, setGameOver, setTimeLeft]);
  
  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (gameLoopId) clearInterval(gameLoopId);
      if (enemySpawnId) clearInterval(enemySpawnId);
    };
  }, [gameLoopId, enemySpawnId]);

  return (
    <>
      {!gameActive && !gameOver && (
        <div className="game-start">
          <h2>Space Shooter</h2>
          <p>Pilot your spaceship through waves of alien enemies!</p>
          <p>Move your mouse to control your ship, click to fire lasers!</p>
          <button className="start-button" onClick={startGame}>Start Game</button>
          <button className="select-button" onClick={goToGameSelection}>Choose Different Game</button>
          <button className="home-button" onClick={goToHome}>Back to Home</button>
        </div>
      )}

      {gameActive && (
        <div 
          className="game-play-area space-shooter-area"
          ref={gameAreaRef}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
        >
          {/* Player spaceship */}
          <div 
            className="player-ship"
            ref={playerRef}
            style={{
              left: `${playerPosition.x}%`,
              bottom: `${100 - playerPosition.y}%`
            }}
          ></div>
          
          {/* Enemies */}
          {enemies.map(enemy => (
            <div
              key={enemy.id}
              className={`enemy enemy-${enemy.type}`}
              style={{
                left: `${enemy.x}%`,
                top: `${enemy.y}%`,
                width: `${enemy.width}px`,
                height: `${enemy.height}px`
              }}
            ></div>
          ))}
          
          {/* Lasers */}
          {lasers.map(laser => (
            <div
              key={laser.id}
              className="laser"
              style={{
                left: `${laser.x}%`,
                top: `${laser.y}%`,
                width: `${laser.width}px`,
                height: `${laser.height}px`
              }}
            ></div>
          ))}
        </div>
      )}

      {gameOver && (
        <div className="game-over">
          <h2>Game Over!</h2>
          <p>Your final score: {score}</p>
          <button className="restart-button" onClick={startGame}>Play Again</button>
          <button className="select-button" onClick={goToGameSelection}>Choose Different Game</button>
          <button className="home-button" onClick={goToHome}>Back to Home</button>
        </div>
      )}
    </>
  );
};

// Snake Game Component
const SnakeGame = ({ 
  score, setScore, 
  timeLeft, setTimeLeft, 
  gameActive, setGameActive, 
  gameOver, setGameOver, 
  goToGameSelection, goToHome 
}) => {
  const gameAreaRef = useRef(null);
  const [snake, setSnake] = useState([]);
  const [food, setFood] = useState(null);
  const [enemies, setEnemies] = useState([]);
  const [direction, setDirection] = useState('RIGHT');
  const [nextDirection, setNextDirection] = useState('RIGHT');
  const [gameLoopId, setGameLoopId] = useState(null);
  const [enemySpawnId, setEnemySpawnId] = useState(null);
  
  // Grid size
  const gridSize = 20; // 20x20 grid
  
  // Start the game
  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameActive(true);
    setGameOver(false);
    
    // Initialize snake in the middle
    const initialSnake = [
      {x: 10, y: 10},
      {x: 9, y: 10},
      {x: 8, y: 10}
    ];
    setSnake(initialSnake);
    
    // Set initial direction
    setDirection('RIGHT');
    setNextDirection('RIGHT');
    
    // Create initial food
    spawnFood(initialSnake);
    
    // Clear any existing enemies
    setEnemies([]);
    
    // Set up game loop
    const loopId = setInterval(() => {
      updateGameState();
    }, 150);
    setGameLoopId(loopId);
    
    // Set up enemy spawning
    const spawnId = setInterval(() => {
      spawnEnemy();
    }, 3000);
    setEnemySpawnId(spawnId);
  };
  
  // Generate a random position on the grid
  const getRandomPosition = (excludePositions = []) => {
    let position;
    let overlapping;
    
    do {
      overlapping = false;
      position = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize)
      };
      
      // Check if position overlaps with any excluded positions
      for (const pos of excludePositions) {
        if (pos.x === position.x && pos.y === position.y) {
          overlapping = true;
          break;
        }
      }
    } while (overlapping);
    
    return position;
  };
  
  // Spawn food at a random position
  const spawnFood = (currentSnake = snake) => {
    const newFood = getRandomPosition(currentSnake);
    setFood(newFood);
  };
  
  // Spawn an enemy at a random position
  const spawnEnemy = () => {
    const excludePositions = [...snake];
    if (food) excludePositions.push(food);
    
    const enemyTypes = ['pirate', 'ufo', 'bat'];
    const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    
    const newEnemy = {
      id: Date.now(),
      ...getRandomPosition(excludePositions),
      type,
      direction: Math.random() > 0.5 ? 'HORIZONTAL' : 'VERTICAL',
      speed: Math.random() > 0.5 ? 1 : -1
    };
    
    setEnemies(prevEnemies => [...prevEnemies, newEnemy]);
  };
  
  // Update game state
  const updateGameState = () => {
    // Update snake position
    moveSnake();
    
    // Move enemies
    moveEnemies();
    
    // Check collisions with food, enemies, walls, and self
    checkCollisions();
  };
  
  // Move the snake
  const moveSnake = () => {
    setDirection(nextDirection);
    
    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const head = {...newSnake[0]};
      
      // Update head position based on direction
      switch (direction) {
        case 'UP':
          head.y = (head.y - 1 + gridSize) % gridSize;
          break;
        case 'DOWN':
          head.y = (head.y + 1) % gridSize;
          break;
        case 'LEFT':
          head.x = (head.x - 1 + gridSize) % gridSize;
          break;
        case 'RIGHT':
          head.x = (head.x + 1) % gridSize;
          break;
        default:
          break;
      }
      
      // Add new head to the front
      newSnake.unshift(head);
      
      // Check if snake eats food
      if (food && head.x === food.x && head.y === food.y) {
        // Increase score
        setScore(prevScore => prevScore + 10);
        
        // Spawn new food
        spawnFood(newSnake);
      } else {
        // Remove tail if no food eaten
        newSnake.pop();
      }
      
      return newSnake;
    });
  };
  
  // Move enemies
  const moveEnemies = () => {
    setEnemies(prevEnemies => {
      return prevEnemies.map(enemy => {
        const newEnemy = {...enemy};
        
        if (enemy.direction === 'HORIZONTAL') {
          newEnemy.x = (newEnemy.x + enemy.speed + gridSize) % gridSize;
        } else {
          newEnemy.y = (newEnemy.y + enemy.speed + gridSize) % gridSize;
        }
        
        return newEnemy;
      });
    });
  };
  
  // Check for collisions
  const checkCollisions = () => {
    const head = snake[0];
    
    // Check collision with self
    for (let i = 1; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        endGame();
        return;
      }
    }
    
    // Check collision with enemies
    for (const enemy of enemies) {
      if (head.x === enemy.x && head.y === enemy.y) {
        endGame();
        return;
      }
    }
  };
  
  // End the game
  const endGame = () => {
    setGameActive(false);
    setGameOver(true);
    
    // Clear intervals
    if (gameLoopId) clearInterval(gameLoopId);
    if (enemySpawnId) clearInterval(enemySpawnId);
  };
  
  // Handle keyboard input for snake direction
  useEffect(() => {
    if (!gameActive) return;
    
    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setNextDirection('UP');
          break;
        case 'ArrowDown':
          if (direction !== 'UP') setNextDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setNextDirection('LEFT');
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') setNextDirection('RIGHT');
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [gameActive, direction]);
  
  // Timer effect
  useEffect(() => {
    if (!gameActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          endGame();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameActive, setTimeLeft]);
  
  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (gameLoopId) clearInterval(gameLoopId);
      if (enemySpawnId) clearInterval(enemySpawnId);
    };
  }, [gameLoopId, enemySpawnId]);

  // Calculate the cell size based on the grid
  const cellSize = 100 / gridSize;

  return (
    <>
      {!gameActive && !gameOver && (
        <div className="game-start">
          <h2>Space Snake</h2>
          <p>Guide your energy snake to collect cubes while avoiding enemies!</p>
          <p>Use arrow keys to change direction.</p>
          <button className="start-button" onClick={startGame}>Start Game</button>
          <button className="select-button" onClick={goToGameSelection}>Choose Different Game</button>
          <button className="home-button" onClick={goToHome}>Back to Home</button>
        </div>
      )}

      {gameActive && (
        <div 
          className="game-play-area snake-game-area"
          ref={gameAreaRef}
        >
          {/* Snake */}
          {snake.map((segment, index) => (
            <div
              key={index}
              className={`snake-segment ${index === 0 ? 'snake-head' : ''}`}
              style={{
                left: `${segment.x * cellSize}%`,
                top: `${segment.y * cellSize}%`,
                width: `${cellSize}%`,
                height: `${cellSize}%`
              }}
            ></div>
          ))}
          
          {/* Food */}
          {food && (
            <div
              className="snake-food"
              style={{
                left: `${food.x * cellSize}%`,
                top: `${food.y * cellSize}%`,
                width: `${cellSize}%`,
                height: `${cellSize}%`
              }}
            ></div>
          )}
          
          {/* Enemies */}
          {enemies.map(enemy => (
            <div
              key={enemy.id}
              className={`snake-enemy enemy-${enemy.type}`}
              style={{
                left: `${enemy.x * cellSize}%`,
                top: `${enemy.y * cellSize}%`,
                width: `${cellSize}%`,
                height: `${cellSize}%`
              }}
            ></div>
          ))}
        </div>
      )}

      {gameOver && (
        <div className="game-over">
          <h2>Game Over!</h2>
          <p>Your final score: {score}</p>
          <button className="restart-button" onClick={startGame}>Play Again</button>
          <button className="select-button" onClick={goToGameSelection}>Choose Different Game</button>
          <button className="home-button" onClick={goToHome}>Back to Home</button>
        </div>
      )}
    </>
  );
};

export default Game;