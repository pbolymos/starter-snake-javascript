import runServer from "./server.js";

// info is called when you create your Battlesnake on play.battlesnake.com
// and controls your Battlesnake's appearance
// TIP: If you open your Battlesnake URL in a browser you should see this data
function info() {
  console.log("INFO");

  return {
    apiversion: "1",
    author: "", // TODO: Your Battlesnake Username
    color: "#838333", // TODO: Choose color
    head: "default", // TODO: Choose head
    tail: "default", // TODO: Choose tail
  };
}

// start is called when your Battlesnake begins a game
function start(gameState) {
  console.log("GAME START");
}

// end is called when your Battlesnake finishes a game
function end(gameState) {
  console.log("GAME OVER\n");
}

function getManhattanDistance(pointA, pointB) {
  return Math.abs(pointA.x - pointB.x) + Math.abs(pointA.y - pointB.y);
}

function findClosestFood(myHead, foodList) {
  let closestFood = null;
  let minDistance = Infinity;

  foodList.forEach(food => {
    const distance = getManhattanDistance(myHead, food);
    if (distance < minDistance) {
      closestFood = food;
      minDistance = distance;
    }
  });

  return closestFood;
}

// move is called on every turn and returns your next move
// Valid moves are "up", "down", "left", or "right"
// See https://docs.battlesnake.com/api/example-move for available data
function move(gameState) {
  let isMoveSafe = {
    up: true,
    down: true,
    left: true,
    right: true
  };

  // Get the board size
  const boardWidth = gameState.board.width;
  const boardHeight = gameState.board.height;

  // Get the current head position of the snake
  const myHead = gameState.you.body[0];
  const myNeck = gameState.you.body[1];
  const myBody = gameState.you.body;

  // Prevent the Battlesnake from moving backwards
  if (myNeck.x < myHead.x) {        // Neck is left of head, don't move left
    isMoveSafe.left = false;

  } else if (myNeck.x > myHead.x) { // Neck is right of head, don't move right
    isMoveSafe.right = false;

  } else if (myNeck.y < myHead.y) { // Neck is below head, don't move down
    isMoveSafe.down = false;

  } else if (myNeck.y > myHead.y) { // Neck is above head, don't move up
    isMoveSafe.up = false;
  }

  // Prevent the Battlesnake from moving out of bounds
  if (myHead.x === 0) {             // Head is at the left edge, don't move left
    isMoveSafe.left = false;
  }
  if (myHead.x === boardWidth - 1) { // Head is at the right edge, don't move right
    isMoveSafe.right = false;
  }
  if (myHead.y === 0) {             // Head is at the bottom edge, don't move down
    isMoveSafe.down = false;
  }
  if (myHead.y === boardHeight - 1) { // Head is at the top edge, don't move up
    isMoveSafe.up = false;
  }

  // Prevent the Battlesnake from colliding with itself
  myBody.forEach(segment => {
    if (segment.x === myHead.x - 1 && segment.y === myHead.y) {
      isMoveSafe.left = false;
    }
    if (segment.x === myHead.x + 1 && segment.y === myHead.y) {
      isMoveSafe.right = false;
    }
    if (segment.x === myHead.x && segment.y === myHead.y - 1) {
      isMoveSafe.down = false;
    }
    if (segment.x === myHead.x && segment.y === myHead.y + 1) {
      isMoveSafe.up = false;
    }
  });

  // Prevent the Battlesnake from colliding with other snakes
  const opponents = gameState.board.snakes;
  opponents.forEach(snake => {
    snake.body.forEach(segment => {
      if (segment.x === myHead.x - 1 && segment.y === myHead.y) {
        isMoveSafe.left = false;
      }
      if (segment.x === myHead.x + 1 && segment.y === myHead.y) {
        isMoveSafe.right = false;
      }
      if (segment.x === myHead.x && segment.y === myHead.y - 1) {
        isMoveSafe.down = false;
      }
      if (segment.x === myHead.x && segment.y === myHead.y + 1) {
        isMoveSafe.up = false;
      }
    });
  });

  // Find the closest food using Manhattan distance
  const closestFood = findClosestFood(myHead, gameState.board.food);

  // If there is food available, prioritize moving towards it
  if (closestFood) {
    if (closestFood.x < myHead.x && isMoveSafe.left) {
      return { move: "left" };
    } else if (closestFood.x > myHead.x && isMoveSafe.right) {
      return { move: "right" };
    } else if (closestFood.y < myHead.y && isMoveSafe.down) {
      return { move: "down" };
    } else if (closestFood.y > myHead.y && isMoveSafe.up) {
      return { move: "up" };
    }
  }

  // Are there any safe moves left?
  const safeMoves = Object.keys(isMoveSafe).filter(key => isMoveSafe[key]);
  if (safeMoves.length === 0) {
    console.log(`MOVE ${gameState.turn}: No safe moves detected! Moving down`);
    return { move: "down" };
  }

  // Choose a random move from the safe moves
  const nextMove = safeMoves[Math.floor(Math.random() * safeMoves.length)];

  console.log(`MOVE ${gameState.turn}: ${nextMove}`)
  return { move: nextMove };
}

runServer({
  info: info,
  start: start,
  move: move,
  end: end,
});