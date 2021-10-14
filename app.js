// invadersDiv is the array that contains the 5 rows of invaders; it is used to determine positioning for left, right and top values, used in changing direction and dropping the invaders at each edge
const invadersDiv = Array.from(document.querySelectorAll(".invaders"));
const controller = document.querySelector(".controller");
const invadersPerRow = 11;
const rows = 5;
const squid = document.querySelector(".squid");
const crab = document.querySelector(".crab");
const crabLower = document.querySelector(".crab-lower");
const octopus = document.querySelector(".octopus");
const octopusLower = document.querySelector(".octopus-lower");
const gameContainer = document.querySelector(".game-container-inner");
const livesContainer = document.querySelector(".life-container");
const gameOverScreen = document.querySelector(".game-over");
// the state variable gives the current image "state" of the invaders, open or closed
let state = "open";
let movingLeft = false;
// lastRender sets the time of the last render, initialised to zero
let lastRender = 0;
// leftPosition gives the current CSS "left" value of the controller, as an integer (removing the "px")
let leftPosition = parseInt(window.getComputedStyle(controller).left);
// drop is true if the invaders should be dropping down a level and false otherwise
let drop = false;
let lives = [1, 2, 3];
let score = 0;
let scoreBoard = document.querySelector(".score");
let isGameOver = false;

function calculateLives() {
  // Remove all child nodes from the lives container, then add back in as many lives as are remaining
  Array.from(document.querySelectorAll(".life")).forEach(life => livesContainer.removeChild(life));
  lives.forEach(() => {
    let life = document.createElement("img");
    life.classList.add("life");
    life.src = "./images/controller.png";
    livesContainer.appendChild(life);
  })
}
calculateLives();

// The createInvaders function creates the images of the 5 rows of invaders, appends them to the correct div and gives them each a unique data ID
function createInvaders() {
  for (let i = 0; i < rows * invadersPerRow; i++) {
    let invader = document.createElement("img");
    invader.classList.add("invader");
    invader.dataset.id = i;

    if (i < invadersPerRow) {
      invader.src = "./images/open-squid.png";
      squid.appendChild(invader);
    } else if (i < invadersPerRow * 2) {
      invader.src = "./images/open-crab.png";
      crab.appendChild(invader);
    }  else if (i < invadersPerRow * 3) {
      invader.src = "./images/open-crab.png";
      crabLower.appendChild(invader);
    } else if (i < invadersPerRow * 4) {
      invader.src = "./images/open-octopus.png";
      octopus.appendChild(invader);
    }  else {
      invader.src = "./images/open-octopus.png";
      octopusLower.appendChild(invader);
    }
  }
}
createInvaders();
const invaders = Array.from(document.querySelectorAll(".invader"));

function getLastInvader() {
  let currentInvaders = Array.from(document.querySelectorAll(".invader"));
  // console.log(currentInvaders[currentInvaders.length-1].dataset.id, lastRow);
  //10, 21, 32, 43, 54 represent the last invader of each row, so set the last row based on whichever living invader has the highest id, then use that to add lastRow pixels to currentTop to determine when the final row hits the bottom
  if (currentInvaders[currentInvaders.length-1].dataset.id <= 10) {
    return 100;
  } else if (currentInvaders[currentInvaders.length-1].dataset.id <= 21) {
    return 75;
  } else if (currentInvaders[currentInvaders.length-1].dataset.id <= 32) {
    return 50;
  } else if (currentInvaders[currentInvaders.length-1].dataset.id <= 43){
    return 25;
  } else return 0;
  // let currentBot2 = window.getComputedStyle(invadersDiv[lastRow]).bottom;
  // let currentBottomRow = window.getComputedStyle(invadersDiv[lastRow]).top;
  // console.log(currentBot2, currentBottomRow); -250, +250
  // console.log(lastRow, currentBottomRow);
  // console.log(window.getComputedStyle(invaders[49]))
}

let animateInvaders;
function animate(currentTime) {
  // first requestAnimationFrame to recursively call the current function, whether or not the animation needs to be updated
  animateInvaders = window.requestAnimationFrame(animate);
  // currentTop gets the current CSS top value of the 5 rows of invaders
  let currentTop = window.getComputedStyle(invadersDiv[0]).top;
  // msSinceRender is the number of milliseconds since the last render
  const msSinceRender = currentTime - lastRender;
  // the invaders only need to update every 500 ms for the first row, then speed increases on each drop
  if (msSinceRender < 500 - parseInt(currentTop)) return;
  lastRender = currentTime;
  // The invader images are called open-xxx and closed-xxx so the state variable updates to "open" or "closed" with each render which allows the images to be switches below
  state == "open" ? state = "closed" : state = "open";
  // currentLeft gets the current margin-left value of the 5 rows of invaders
  let currentLeft = window.getComputedStyle(invadersDiv[0]).marginLeft;

  // Get the last invader in the currentInvaders array to check how low down it is
  let lastRow = getLastInvader();
  // For XL screens, the invaders have 800px to move around in, from a margin-left value of -400px to 400px, so this changes their direction at each edge
  if (currentLeft == "-400px") {
    // setting movingLeft to false changes the direction of the invaders in the moveInvaders function below
    movingLeft = false;
    // in order for the invaders to drop one level, pause, and then move right or left again, the variable drop changes from false to true as the invaders hit the left or right wall, and they drop (but moveInvaders isn't called so they don't move right or left). During the next render, drop is then changed from true to false, which then allows the moveInvaders function to be called so they can start moving left or right again
    drop = !drop;
  } else if (currentLeft == "400px") {
    movingLeft = true;
    drop = !drop;
  }
  // The state variable above is used to change the images on each render
  invaders.forEach(invader => {
    if (invader.classList.contains("pop")) return;
    if (parseInt(invader.dataset.id) < 11) {
      invader.src = `./images/${state}-squid.png`;
    } else if (parseInt(invader.dataset.id) < 33) {
      invader.src = `./images/${state}-crab.png`;
    } else if (parseInt(invader.dataset.id) < 55) {
      invader.src = `./images/${state}-octopus.png`;
    }
  });
  if (drop) {
    // lastRow increases by 25 for each row, so when (eg) the bottom row is eliminated, lastRow is 25. If all rows are eliminated but the top row, lastRow is 100
    currentTop = Number(currentTop.slice(0, -2)) + 17.5;
    invadersDiv.forEach(row => row.style.top = currentTop + "px");
    // lastRow increases by 25 for each row, so when (eg) the bottom row is eliminated, lastRow is 25. If all rows are eliminated but the top row, lastRow is 100
    if (currentTop >= 225 + lastRow) {
      console.log(currentTop, 225+lastRow); // BOTTOM ROW: 227.5 225 2ND ROW: 255.5 250 3rd: 289.5 275
      isGameOver = true;
      gameOver();
      return;
    }
  } else {
      moveInvaders(currentLeft);
  }
}
animateInvaders = window.requestAnimationFrame(animate);

// The move function uses the current margin-left value (currentLeft) and either adds or removes 20px based on whether or not the invaders are moving right or left
function moveInvaders(currentLeft) {
  // use parseInt to convert string to integer and also remove "px"
  if (movingLeft) {
    currentLeft = parseInt(currentLeft) - 20;
  } else {
    currentLeft = parseInt(currentLeft) + 20;
  }
  invadersDiv.forEach(row => {
    row.style.marginLeft = currentLeft + 'px';
  });
}

// keyPosition is an object that will store the keyCode of any key pressed as a key, with the value being true if the key is currently pressed, or false if it isn't. This stops the lag produced using the "keydown" event listener
let keyPosition = {};
window.addEventListener("keydown", e => keyPosition[e.keyCode] = true);
window.addEventListener("keyup", e => keyPosition[e.keyCode] = false);

// the moveController function takes in the keyCode of the key being pressed to determine whether to move left or right
function moveController() {
  if (isGameOver) return;
  // the leftPosition of -425px is where the invaders touch the left side of the board, and 425px is the right hand side
  if (keyPosition[37] && leftPosition >= -425) {
    // the leftPosition is reduced by 10px at a time to move left, and increased by 10px to move right
    leftPosition -= 10;
    controller.style.left = leftPosition + "px";
  } else if (keyPosition[39] && leftPosition <= 425) { //915) {
    leftPosition += 10;
    controller.style.left = leftPosition + "px";
  }
  // the setTimeout calls the moveController function every 30 ms to check the state of the keys, this is to stop the lag to make controller movement smoother
  setTimeout(moveController, 30);
}
moveController();

function createBullet(e) {
  if (keyPosition[32]) {
    // Can't access bullet directly as it hasn't been declared, so check for an element with the class of bullet to make sure only one bullet is fired at once - also make sure no bullet is fired if the game has ended
    if (document.querySelector(".bullet") || isGameOver) return;
    let bullet = document.createElement("div");
    bullet.classList.add("bullet");
    gameContainer.appendChild(bullet);
    bullet.style.left = controller.offsetLeft + 22.5 - 1.5 + "px";
    bullet.style.bottom = "112px";
    moveBullet(bullet);
  }
}
window.addEventListener("keydown", createBullet);

function moveBullet(bullet) {
  let bulletPath = setInterval(() => {
    if (parseInt(bullet.style.bottom) > 530) {
    clearInterval(bulletPath);
    bullet.remove();
    } else {
      bullet.style.bottom = parseInt(bullet.style.bottom) + 10 + "px";
    }
    detectCollision(bullet, bulletPath);
  }, 25)
}

function detectCollision(bullet, bulletPath) {
  let bulletShape = bullet.getBoundingClientRect();
  invaders.map(invader => {
    let id = invader.dataset.id;
    let invaderShape = invader.getBoundingClientRect();
    if (bulletShape.right > invaderShape.left && bulletShape.left < invaderShape.right && bulletShape.top < invaderShape.bottom && bulletShape.bottom > invaderShape.top) {
      if (invader.classList.contains("invader")) {
        invaders[id].classList.add("pop");
        invaders[id].classList.remove("invader");
        invaders[id].src = "./images/pop.png";
        score += 10;
        scoreBoard.innerHTML = `SCORE  ${score}`;
        setTimeout(() => {
          invaders[id].src = "./images/none.png";
        }, 200);
        clearInterval(bulletPath);
        bullet.remove();
        detectWin();
      }
    }
  })
}

function createInvaderBullet() {
  if (isGameOver) return;
  let invBullet = document.createElement("img");
  invBullet.classList.add("invbullet");
  invBullet.src = "./images/invbullet.png";
  invBullet.classList.add("bullet-closed");

  let livingInvaders = Array.from(document.querySelectorAll(".invader"));
  let randomInvader = Math.floor(Math.random() * (livingInvaders.length-1));
  let randomInvaderId = livingInvaders[randomInvader].dataset.id;
  // initially set the left and top values to match up to the bottom of the shooting invader (+18 for half the width of the invader, -5 for half the width of the invader bullet)
  invBullet.style.left = invaders[randomInvaderId].getBoundingClientRect().x + 18 - 5 + "px";
  invBullet.style.top = parseInt(invaders[randomInvaderId].getBoundingClientRect().y) + 25 + "px";
  gameContainer.appendChild(invBullet);
  moveInvaderBullet(invBullet);
}
createInvaderBullet();

function moveInvaderBullet(invBullet) {
  let shootInterval = setInterval(() => {
    // Alternate between the left and right versions of the bullet ("closed" and "open")
    if (invBullet.classList.contains("bullet-closed")) {
      invBullet.src = "./images/invbulletopen.png"
      invBullet.classList.remove("bullet-closed");
    } else {
      invBullet.src = "./images/invbullet.png";
      invBullet.classList.add("bullet-closed");
    }
    invBullet.style.top = parseInt(invBullet.style.top) + 10 + "px";
    let controllerPosition = controller.getBoundingClientRect();
    let invBulletPosition = invBullet.getBoundingClientRect();
    if (invBulletPosition.bottom > controllerPosition.top && invBulletPosition.right > controllerPosition.left && invBulletPosition.left < controllerPosition.right) {
      clearInterval(shootInterval);
      invBullet.remove();
      if (lives.length > 0) {
        lives.pop();
        calculateLives();
      } else {
        isGameOver = true;
        gameOver();
        return;
      }
      setTimeout(() => {
        createInvaderBullet();
      }, 2500)
      return;
    }
    if (parseInt(invBullet.style.top) > 620) {
      clearInterval(shootInterval);
      invBullet.remove();
      setTimeout(() => {
        createInvaderBullet();
      }, 2500)
    }
  }, 25)
}

function gameOver() {
  window.cancelAnimationFrame(animateInvaders);
  gameOverScreen.innerHTML = "Game over!";
}

function detectWin() {
  let remainingInvaders = Array.from(document.querySelectorAll(".invader"));
  if (remainingInvaders.length === 0) {
    isGameOver = true;
    window.cancelAnimationFrame(animateInvaders);
    gameOverScreen.innerHTML = "You win!";
  }
}