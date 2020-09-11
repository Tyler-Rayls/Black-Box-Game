var score;
var currentEntry;
var correctGuesses;
var doors = new Set();
var guesses = new Set();
var atoms = new Set();
var doorColors;
var factors = setFactors();
var turns = setTurns();
var scoreBoard = document.getElementById("score");
var newGameBtn = document.getElementById("reset");
var numAtoms = document.getElementById("num-of-atoms");
var squares = document.getElementsByClassName("square");
var board = createBoard();
var guessClick = function() {guessAtom(this)};
var shotClick = function() {shootRay(this)};

newGameBtn.addEventListener("click", function () {
    main()
});
numAtoms.addEventListener("change", function() {
    main();
});

// Calls the main function to initiate game play when the page is first loaded
main();

// Resets the variables and displays so that a new game can be played
function main() {
    score = 25;
    correctGuesses = 0;
    doorColors = ["#C0392B", "#9B59B6", "#2980B9", "#1ABC9C", "#27AE60", "#F1C40F", "#E67E22", "#34495E", "#E74C3C", "#8E44AD", "#3498DB", "#16A085", "#2ECC71", "#F39C12", "#D35400", "#2C3E50"];
    doors.clear();
    guesses.clear();
    createAtoms();
    displayScore();
    activateSquares();
    resetVisuals();
};

// Creates the atoms for the current game
function createAtoms() {
    // Clears the atom set from previous gameplay
    atoms.clear();
    // Randomly generates row and column numbers and adds the associated element in the
    // 10x10 game board to the atoms set
    while(atoms.size < numAtoms.value) {
        var row = Math.floor(Math.random() * 8) + 1;
        var col = Math.floor(Math.random() * 8) + 1;
        atoms.add(board[row][col]);
    };
};  

// Receieves an integer, updates the score total, and calls to update the score display
function updateScore(points) {
    score -= points;
    displayScore();
};

// Updates the score display
function displayScore() {
    // Checks if the game was lost
    if(gameLost()) {
        // Sets the score to 0 if the game was lost and deactivates the game squares
        score = 0;
        deactivateSquares();
    };
    scoreBoard.textContent = score;
};

// Checks if the user's most recent shot or guess has caused them to run out of points
function gameLost() {
    if(score <= 0) {
        return true;
    } else {
        return false;
    };
};

// Creates a 10x10 grid from the elements in squares 
function createBoard() {
    var board = []
    for(var row = 0; row < 10; row++) {
        board[row] = [];
        for(var col = 0; col < 10; col++) {
            board[row].push(squares[(row * 10) + col]);
        };
    };
    return board;
};

// Adds event listeners so that squares in the document call the correct functions when clicked
function activateSquares() {
    for(var i = 0; i < squares.length; i++) {
        if(squares[i].classList.contains("border-square")) {
            squares[i].addEventListener("click", shotClick);
        } else if(squares[i].classList.contains("atom-square")) {
            squares[i].addEventListener("click", guessClick);
        };
    };
};

// Removes the event listeners from the squares
function deactivateSquares() {
    for(var i = 0; i < squares.length; i++) {
        if(squares[i].classList.contains("border-square")) {
            squares[i].removeEventListener("click", shotClick);
        } else if(squares[i].classList.contains("atom-square")) {
            squares[i].removeEventListener("click", guessClick);
        };
    };
};

// Checks if square that was clicked is the home of one of the randomly generated atoms
// recieves: the square that was clicked
function guessAtom(guess) {
    // Deducts 5 points if the square is not the home of an atom and has not been guessed before
    // Marks the square if it is the home of an atom
    if(!(atoms.has(guess)) && !(guesses.has(guess))) {
        updateScore(5);
    } else if(atoms.has(guess)) {
        markAtom(guess);
    };
    // Adds the square to the guesses set
    guesses.add(guess);
};

// Returns the row and col index in the board of a square that was clicked
function getSquareIndex(square) {
    for(var row = 0; row < 10; row++) {
        if(board[row].indexOf(square) !== -1) {
            return [row, board[row].indexOf(square)];
        };
    };
};

// Shoots a ray from a border square into the inner 8x8 grid
function shootRay(entry) {
    // Gets the row and col index of the border square that was clicked
    var location = getSquareIndex(entry);
    var row = location[0];
    var col = location[1];

    // Marks the square that was clicked as an entry point
    markEntry(entry);

    // Deducts 1 point and adds the entry point to the doors set if it isn't already in it
    if(!(doors.has(entry))) {
        doors.add(entry);
        updateScore(1);
    };

    // Gets the direction the ray is headed
    var direction = getEntryDirection(row, col);

    // Checks for a border deflection that would change the rays path immediately
    var new_direction = deflectionCheck(row, col, direction);

    // Checks if the path hasnt been changed and begins to find the ray path
    // If the direction is changed, game rules dictate it behaves like a reflection and marks the entry
    // point as the exit point.
    if(new_direction === direction) {
        rayPath(row, col, direction, true);
    } else {
        markExit(entry);
    };
};

// Checks if there are atoms to the sides and in front of the ray's current location that would cause
// a deflection
function deflectionCheck(row, col, direction) {
    // Uses the current direction and factors map to identify the 2 (row, col) locations that would
    // cause a deflection
    var deflections = [board[row+factors.get(direction)[0]][col+factors.get(direction)[1]],
                       board[row+factors.get(direction)[2]][col+factors.get(direction)[3]]
    ];

    // If both deflections exist, the ray direction is reflected back
    // If only 1 of the 2 deflections exist, the direction of the ray is turned appropriately
    // Uses the current direction and turns map to identify the new direction
    if(atoms.has(deflections[0]) && atoms.has(deflections[1])) {
        direction = turns.get(direction)[0];
    } else if(atoms.has(deflections[0])) {
        direction = turns.get(direction)[1];
    } else if(atoms.has(deflections[1])) {
        direction = turns.get(direction)[2];
    };

    // Returns the direction
    return direction;
};

// Creates a map for deflectionCheck to find deflections using the ray's current direction
function setFactors() {
    var factors = new Map();
    factors.set("left", [-1, -1, 1, -1]);
    factors.set("right", [-1, 1, 1, 1]);
    factors.set("up", [-1, -1, -1, 1]);
    factors.set("down", [1, -1, 1, 1]);
    return factors;
};

// Creates a map for deflectionCheck to use the ray's current direction and deflections
// to find the new direction
function setTurns() {
    var turns = new Map();
    turns.set("left", ["right", "down", "up"]);
    turns.set("right", ["left", "down", "up"]);
    turns.set("up", ["down", "right", "left"]);
    turns.set("down", ["up", "right", "left"]);
    return turns;
};

// Calculates the path of the ray through the game board checking for hits, exits, and deflections
function rayPath(row, col, direction, isEntry) {
    // Validates this is not the first call of rayPath for this shot
    if(isEntry === false) {
        // Checks if the ray has reached a border square and marks it as an exit if it has
        if(board[row][col].classList.contains("border-square")) {
            markExit(board[row][col]);
            // If the exit has not been an entry or exit before, deducts a point and adds to the doors set
            if(!(doors.has(board[row][col]))) {
                updateScore(1);
                doors.add(board[row][col]);
            };
            return;
        };
    };
    // Checks if the ray is about to hit an atom and marks the hit if so
    if(checkHit(row, col, direction)) {
        markHit();
        return;
    };

    // Checks for a deflection and sets a new direction
    var direction = deflectionCheck(row, col, direction);

    // Calls rayPath with the new progression based upon the ray's direction
    if(direction === "left") {
        rayPath(row, col-1, direction, false);
    } else if(direction === "right") {
        rayPath(row, col+1, direction, false);
    } else if(direction === "up") {
        rayPath(row-1, col, direction, false);
    } else {
        rayPath(row+1, col, direction, false);
    };
};

// Checks if the ray is about to hit an atom
function checkHit(row, col, direction) {
    // Adjusts the row/col depending on the direction to check for an atom ahead of the ray
    if(direction === "left") {
        col -=1;
    } else if(direction === "right") {
        col += 1;
    } else if(direction === "up") {
        row -+ 1;
    } else if(direction === "down") {
        row += 1;
    };
    // Returns true if there is an atom 1 square ahead of the ray and false if there isn't
    if(atoms.has(board[row][col])) {
        return true;
    } else {
        return false;
    };
};

// Returns the direction the ray is headed based on index of the border square that was clicked
function getEntryDirection(row, col) {
    if(row === 0) {
        return "down";
    } else if(row === 9) {
        return "up";
    } else if(col === 0) {
        return "right";
    } else {
        return "left";
    };
};

// Displays an atom on the square where the user guessed
function markAtom(atom) {
    // Increments the correctGuesses counter 
    correctGuesses += 1;
    // Finds the child span of the atom-square and displays it
    var span = atom.children[0];
    span.classList.remove("d-none");
    span.classList.add("d-flex");
    // Checks if the user has found all the atoms
    if(correctGuesses === atoms.size) {
        gameWon();
    };
};

// Marks the border-square that the user clicked as an entry point
function markEntry(entry) {
    // Finds the child span of the border-square and displays it with a color from the color list
    var span = entry.children[0];
    span.classList.remove("d-none");
    span.classList.add("d-flex");
    span.style.fill = doorColors.pop();
    // Stores the currentEntry to mark the exit (if there is one) with the same color
    currentEntry = entry;
};

// Marks the border-square of a ray's exit with a faded "border" that matches the color of the entry square
// Need to fix it so it doesn't override hit markings from entries
// Also capable of overwriting previous exits from other entries - how to handle this?
function markExit(exit) {
    var borderStyle = "inset 0 0 8px 1px " + currentEntry.children[0].style.fill;
    exit.style.boxShadow = borderStyle;
};

// Changes the background of an entry square to a light red if the ray hit an atom
function markHit() {
    currentEntry.style.backgroundColor = "#FADBD8";
};

// Deactivates the game squares when the user has won
function gameWon() {
    deactivateSquares();
    // Do something to signify a win
};

// Resets the game board to hide any atom guesses, ray entries, ray exits, and atom hits from the 
// previous game
function resetVisuals() {
    for(var i = 0; i < squares.length; i++) {
        if(squares[i].children[0] !== undefined) {
            var child = squares[i].children[0];
            if(child.classList.contains("d-flex")) {
                squares[i].children[0].classList.remove("d-flex");
                squares[i].children[0].classList.add("d-none");
            };
            if(squares[i].classList.contains("border-square")) {
                squares[i].style.boxShadow = "";
                squares[i].style.backgroundColor = "#BDC3C7";
            };
        };
    };
};