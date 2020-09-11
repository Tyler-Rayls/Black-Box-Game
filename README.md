# Black-Box-Game
A html/css/javascript web app representation of the the abstract board game Black Box.

A brief overview of the history and rules of the game can be found here:  https://en.wikipedia.org/wiki/Black_Box_(game)

The wikipedia page includes images of how the ray interacts with atoms on the board. These images are very helpful in understanding how to play the game.

Specific to this representation of the game:
1) You can choose the number of atoms to place on the board. This is limited between 1 and 9 atoms.
2) You start the game with 25 points
  - You lose 1 point for each ray entry and exit
  - The entries and exits act like doors. Once they are open you lose a point, but they do not close. 
  - Therefore, you can only lose 1 point per border square. 
  - You lose 5 points if you incorrectly guess an atom location
3) When you click on a border square, a ray gun will appear with a specific color
  - If the ray exits the board, a border will appear around the square of the same color
  - If the ray hits an atom, the background behind the ray gun will turn to a light red
3) You click on one of the squares on the internal 8x8 grid to guess an atom. You can guess for atoms whenever you want to. 
  - Similiar to the border squares, you can only lose points on any given "atom-square" once. 
  
This game is going to continually be updated to improve efficiency and readability of the code as I learn better Javascript practices. 

I hope you enjoy. 

Tyler


