'use strict';

var app = angular.module("minesweeper-app");
app.controller("HomeController", ['$scope', function($scope){

    const MINE = -1;
    const DIFFICULTY_HARD   = 2;
    const DIFFICULTY_MEDIUM = 1;
    const DIFFICULTY_EASY   = 0;
    $scope.difficultyLabels = [ "Easy", "Medium", "Hard" ]; // corresponds to the index

    const PROPORTION_OF_MINES = {};
    PROPORTION_OF_MINES[DIFFICULTY_HARD]    = 0.25;
    PROPORTION_OF_MINES[DIFFICULTY_MEDIUM]  = 0.15;
    PROPORTION_OF_MINES[DIFFICULTY_EASY]    = 0.10;

    // Setup Game
    $scope.isGameSetup = false;
    $scope.selectedDifficulty = false;
    $scope.selectedBoardSize = false;

    $scope.score          = 0;
    $scope.secondsElapsed = 0;
    $scope.movesMade      = 0; // the number of moves made
    $scope.numRows        = 0;
    $scope.numCols        = 0;
    $scope.boardSize      = 0; // this is the number of rows and columns.
    $scope.numMines       = 0; // the number of mines on the board
    $scope.numPositionsExposed = 0;

    // POSSIBLE POINTS
    const ONE_MINE    = 1;
    const TWO_MINES   = 2;
    const THREE_MINES = 3;
    const FOUR_MINES  = 4;
    const FIVE_MINES  = 5;
    const SIX_MINES   = 6;
    const SEVEN_MINES = 7;
    const EIGHT_MINES = 8;

    // The standard colors for each number in minesweeper
    $scope.colorMap = [
      "white",    // zero mines are adjacent
      "blue",     // one mine is adjacent
      "darkred",  // two mines are adjacent
      "darkblue", // etc.
      "brown",
      "cyan",
      "black",
      "grey"
    ];

    /* Expose the element indexed by the parameters. Also
    kick off any post processing required after the element
    has been exposed.*/
    // function exposeElement(rowInd, colInd, exposeOnlyIfZero)
    function exposeElement(rowInd, colInd)
    {
      if(!$scope.exposedView[rowInd][colInd]){
        ++$scope.numPositionsExposed;
        console.log("Exposing element -> ", rowInd, colInd);
        $scope.exposedView[rowInd][colInd] = true;
        // If we need any post processing, we handle it here.
      }
    }

    /* Expose the entire board. Take care of any post processing
    required after all the elements have been exposed. */
    function exposeEverything()
    {
      for(var i=0; i<$scope.exposedView.length; i++){
        for(var j=0; j<$scope.exposedView[i].length; j++){
          exposeElement(i, j, false);
        }
      }
      // Post processing (ex. score valuation) after all the elements are exposed
    };

    /* Checks the state of the board. If the position is not a mine, it will
    then evaluate the position. This means:
      1. It will display the value to the user
      2. Evaluate whether to expand the surrounding area of the element.
    */
    $scope.evaluatePosition = function(rowPos, valPos)
    {
      console.log("Evaluating position:", {column: valPos, row: rowPos});
      if($scope.exposedView[rowPos][valPos]){
        console.log("Already exposed. We don't need to check this again.");
        return;
      }
      ++$scope.movesMade;
      if($scope.boardElements[rowPos][valPos] == MINE){
        alert("Oh no! You hit a mine! You just lost.");
        exposeEverything();
        return;
      }
      expandPosition(rowPos, valPos); // expand around this position if all adjacent elements are alread viewable
      exposeElement(rowPos, valPos);
      checkBoardState();
    };

    /* This will make all the itms around this position viewable if we are
    able to determine that a fenced area around this column is already visile. */
    function expandPosition(rowPos, valPos)
    {
      console.log("Expanding the area around the position", rowPos, valPos);
      if(rowPos < 0 || rowPos >= $scope.boardElements.length){
        console.log("Beyond row bounds.");
        return;
      }
      if(valPos < 0 || valPos >= $scope.boardElements[rowPos].length){
        console.log("Beyond col bounds");
        return;
      }

      if($scope.exposedView[rowPos][valPos]) return;
      exposeElement(rowPos, valPos);
      if($scope.boardElements[rowPos][valPos] != 0){
        console.log("This element is not 0 or is already exposed. Not expanding around it.");
        return;
      }
      for(var i=rowPos-1; i<=rowPos+1; i++){
        for(var j=valPos-1; j<=valPos+1; j++){
          if(i == rowPos && j == valPos) continue;
          if(i >= 0 && i<$scope.boardElements.length
            && j>=0 && j<$scope.boardElements[i].length)
          {
              expandPosition(i, j);
          }
        }
      }
    };

    /* Determines whether the user has won or not. */
    function checkBoardState()
    {
      console.log("Number of positions exposed", $scope.numPositionsExposed);
      if($scope.numPositionsExposed == ($scope.boardSize - $scope.numMines))
      {
        alert("You won!");
        exposeEverything();
      }
      // any post processing
    };

    /* This will randomly generate a "size" x "size" board with the given size.
    It will randomize a number of mines and place them. This will be a fraction
    of the size of the board (depending on the difficulty). */
    function generateBoard(numRows, numCols, difficulty)
    {
      console.log("Playing with difficulty: ", difficulty);
      var numberOfElements = numRows*numCols;
      var numberOfMines = Math.ceil(PROPORTION_OF_MINES[difficulty] * numberOfElements);
      console.log("Number of mines -> ", numberOfMines);
      $scope.numRows = numRows;
      $scope.numCols = numCols;
      $scope.numMines = numberOfMines;
      $scope.boardSize = numberOfElements;
      $scope.boardElements = placeMinesRandomly(numberOfMines);
      $scope.exposedView = [];
      for(var i=0; i<$scope.numRows; i++){
        var row = [];
        for(var j=0; j<$scope.numCols; j++){
          row.push(false);
        }
        $scope.exposedView.push(row);
      }
      console.log("Grid With Mines -> ", $scope.boardElements);
    };

    /* Places all the mines randomly on the board. */
    function placeMinesRandomly(numberOfMines)
    {
      console.log("placing mines randomly");
      var gridWithMines = [];

      // generate a clean grid
      for(var i=0; i<$scope.numRows; i++){
        var row = [];
        for(var j=0; j<$scope.numCols; j++){
          row.push(0);
        }
        gridWithMines.push(row);
      }

      // randomly place mines in the grid
      var numPlaced = 0;
      while(numPlaced < numberOfMines){
        var randRow = Math.floor(Math.random() * ($scope.numRows-1));
        var randCol = Math.floor(Math.random() * ($scope.numCols-1));
        if(gridWithMines[randRow][randCol] != MINE){
          gridWithMines[randRow][randCol] = MINE;
          gridWithMines = adjustAroundPosition(gridWithMines, randRow, randCol);
          numPlaced++;
        }
      }

      return gridWithMines;
    };

    /* Adjusts the numeric values around the given position where a mine has
    been placed. */
    function adjustAroundPosition(gridWithMines, row, col)
    {
      if(gridWithMines[row][col] != MINE) return;
      for(var i=row-1; i<=row+1; i++){
        for(var j=col-1; j<=col+1; j++){
          if(i<0 || i>=gridWithMines.length || j<0 || j>= gridWithMines[i].length){
            // out of bounds of evaluation
            continue;
          }
          if(i==row && j==col) continue;
          if(gridWithMines[i][j] == MINE) continue;
          gridWithMines[i][j] += 1; // increase it by 1
        }
      }
      return gridWithMines;
    };

    /* Sets the difficulty for the game. */
    $scope.selectDifficulty = function(difficulty)
    {
      console.log("Selected Difficulty", difficulty);
      $scope.difficulty = difficulty;
      $scope.selectedDifficulty = true;
    }

    $scope.selectBoardSize = function(numRows, numCols){
      console.log("Selected Board Size", numRows, numCols);
      $scope.numRows = numRows;
      $scope.numCols = numCols;
      $scope.selectedBoardSize = true;
    }

    /* Sets up all the parameters for the game. */
    $scope.startGame =  function(){
      console.log("Starting game...");
      generateBoard($scope.numRows, $scope.numCols, $scope.difficulty);
      $scope.isGameSetup = true;
    }

    /* Somewhat like a constructor for the controller. */
    function _init()
    {
      console.log("initialized home controller.");
      generateBoard(13, 14, DIFFICULTY_MEDIUM);
      console.log("Board Elements", $scope.boardElements);
      console.log("Hiding out all elements from the user.");
    };

    _init();
}]);
