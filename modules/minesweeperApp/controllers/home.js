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
    $scope.isGameSetup        = false;
    $scope.selectedDifficulty = false;
    $scope.selectedBoardSize  = false;
    $scope.wonLastGame        = false;

    $scope.score          = 0; // for future purposes
    $scope.secondsElapsed = 0;
    $scope.movesMade      = 0; // the number of moves made
    $scope.numRows        = 0;
    $scope.numCols        = 0;
    $scope.boardSize      = 0; // this is the number of rows and columns.
    $scope.numMines       = 0; // the number of mines on the board
    $scope.numPositionsExposed = 0;

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

    /* This will make all the itms around this position viewable if we are
    able to determine that a fenced area around this column is already visile. */
    function expandPosition(rowPos, valPos)
    {
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
        exposeEverything();
        askForNewGame(false);
        return;
      }
      expandPosition(rowPos, valPos); // expand around this position if all adjacent elements are alread viewable
      exposeElement(rowPos, valPos);
      checkBoardState();
    };

    /* Determines whether the user has won or not. */
    function checkBoardState()
    {
      console.log("Number of positions exposed", $scope.numPositionsExposed);
      if($scope.numPositionsExposed == ($scope.boardSize - $scope.numMines))
      {
        exposeEverything();
        askForNewGame(true);
      }
      // any post processing
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

    /* Sets the difficulty for the game. */
    $scope.selectDifficulty = function(difficulty)
    {
      console.log("Selected Difficulty", difficulty);
      $scope.difficulty = difficulty;
      $scope.selectedDifficulty = true;
    };

    /* Configures the size of the game baord. */
    $scope.selectBoardSize = function(numRows, numCols)
    {
      console.log("Selected Board Size", numRows, numCols);
      if(numRows < 5 || numCols < 5 || numRows > 25 || numCols > 25){
        // so that our board doesn't look awkward or fail to generate
        generateAlert("alert-danger", "Your board dimensions must be between 5 and 25. ex. 5x5");
        return;
      }
      $scope.numRows = numRows;
      $scope.numCols = numCols;
      $scope.selectedBoardSize = true;
    };

    /* Prompts users for a new game */
    function askForNewGame(wonLastGame)
    {
      console.log("ask for new game...");
      if(wonLastGame){
        generateAlert("alert-success", "You won!!");
      }
      else{
        generateAlert("alert-danger", "You lost. Next time maybe.");
      }
      $scope.wonLastGame = wonLastGame;
      $scope.promptNewGame = true;
    };

    /* Sets the parameters for a new game. Resets all the values. */
    $scope.newGame = function(){
      console.log("Starting new game.");
      generateAlert("alert-info", "New game!");
      $scope.promptNewGame = false;
      $scope.isGameSetup = false;
      $scope.selectedDifficulty = false;
      $scope.selectedBoardSize = false;
      $scope.score = $scope.movesMade = $scope.secondsElapsed = 0;
    };

    /* Initiates the game. */
    $scope.startGame =  function()
    {
      console.log("Starting game...");
      generateAlert("alert-success", "Excellent. The Game begins.");
      generateBoard($scope.numRows, $scope.numCols, $scope.difficulty);
      $scope.isGameSetup = true;
    };

    /* Generates an alert that shows and then hides after a few seconds. */
    function generateAlert(alertType, alertMessage)
    {
      console.log("Generating Alert", alertType, alertMessage);
      $scope.alertType = alertType;
      $scope.alertMessage = alertMessage;
      $('#main-alert').show();
      setTimeout(function(){
        $('#main-alert').hide('fast');
      }, 5000);
    };

    /* Somewhat like a constructor for the controller. */
    function _init()
    {
      console.log("initialized home controller.");
      $('#main-alert').hide();
      generateAlert("alert-info", "Setting it all up :D")
      $scope.newGame();
    };

    _init();
}]);
