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
// the state variable gives the current image "state" of the invaders, open or closed
let state = "open";
let movingLeft = false;
// lastRender sets the time of the last render, initialised to zero
let lastRender = 0;
// leftPosition gives the current CSS "left" value of the controller, as an integer (removing the "px")
let leftPosition = parseInt(window.getComputedStyle(controller).left);
// drop is true if the invaders should be dropping down a level and false otherwise
let drop = false;
let score = 0;
let scoreBoard = document.querySelector(".score");

// The createInvaders function creates the images of the 5 rows of invaders, appends them to the correct div and gives them each a unique data ID
function createInvaders() {
    for (let i = 0; i < rows * invadersPerRow; i++) { 
        let invader = document.createElement("img");
        invader.classList.add("invader");
        invader.dataset.id = i;

        if (i < invadersPerRow) {
            invader.src = "./aliens/open-squid.png";
            squid.appendChild(invader);
        } else if (i < invadersPerRow * 2) {
            invader.src = "./aliens/open-crab.png";
            crab.appendChild(invader);
        }  else if (i < invadersPerRow * 3) {
            invader.src = "./aliens/open-crab.png";
            crabLower.appendChild(invader);
        } else if (i < invadersPerRow * 4) {
            invader.src = "./aliens/open-octopus.png";
            octopus.appendChild(invader);
        }  else {
            invader.src = "./aliens/open-octopus.png";
            octopusLower.appendChild(invader);
        }
    }
}
createInvaders();
const invaders = Array.from(document.querySelectorAll(".invader"));


function animate(currentTime) {
    // first requestAnimationFrame to recursively call the current function, whether or not the animation needs to be updated
    window.requestAnimationFrame(animate);
    // msSinceRender is the number of milliseconds since the last render
    const msSinceRender = currentTime - lastRender;
    // the aliens only need to update once per second, or every 1000 ms
    if (msSinceRender < 550) return;
    lastRender = currentTime;
    // The invader images are called open-xxx and closed-xxx so the state variable updates to "open" or "closed" with each render which allows the images to be switches below
    state == "open" ? state = "closed" : state = "open";
    // currentLeft gets the current margin-left value of the 5 rows of invaders
    let currentLeft = window.getComputedStyle(invadersDiv[0]).marginLeft;
    // currentTop gets the current CSS top value of the 5 rows of invaders
    let currentTop = window.getComputedStyle(invadersDiv[0]).top;
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
        if (parseInt(invader.dataset.id) < 11) {
            invader.src = `./aliens/${state}-squid.png`;
        } else if (parseInt(invader.dataset.id) < 33) {
            invader.src = `./aliens/${state}-crab.png`;
        } else if (parseInt(invader.dataset.id) < 55) {
            invader.src = `./aliens/${state}-octopus.png`;
        }
    });
    if (drop) {
        currentTop = parseInt(currentTop) + 25;
        invadersDiv.forEach(row => row.style.top = currentTop + "px");
        // On the 10th drop it's game over; the invaders drop 25px at a time, so at 250px it's game over
        if (currentTop == 250) alert("Game over");
    } else {
        moveInvaders(currentLeft);
    }
}
window.requestAnimationFrame(animate);

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
var keyPosition = {};
window.addEventListener('keydown', e => keyPosition[e.keyCode] = true);
window.addEventListener('keyup', e => keyPosition[e.keyCode] = false);

// the moveController function takes in the keyCode of the key being pressed to determine whether to move left or right
function moveController() {
    // the leftPosition of -425px is where the invaders touch the left side of the board, and 425px is the right hand side
    if (keyPosition[37] && leftPosition > -425) {
        // the leftPosition is reduced by 10px at a time to move left, and increased by 10px to move right
        leftPosition -= 10;
        controller.style.left = leftPosition + "px";
    } else if (keyPosition[39] && leftPosition < 425) {
        leftPosition += 10;
        controller.style.left = leftPosition + "px";
    }
    // the setTimeout calls the moveController function every 30 ms to check the state of the keys, this is to stop the lag to make controller movement smoother
    setTimeout(moveController, 30);
}
moveController();


// during interview:
// spaceship can shoot enemies by pressing space
// enemies can shoot me - one shot at a time, choose random enemy based on who is close to me?
// if no enemy is hit, the shot goes off the top of the screen
// if an enemy is hit, then he explodes and the shot disappears
// there are different types of enemies that are worth different points
// game over