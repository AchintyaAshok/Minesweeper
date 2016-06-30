'use strict';

var app = angular.module("minesweeper-app");
app.controller("HomeController", ['$scope', function($scope){

    const MINE = -1;
    const DIFFICULTY_HARD   = 3;
    const DIFFICULTY_MEDIUM = 2;
    const DIFFICULTY_EASY   = 1;
    const PROPORTION_OF_MINES = {};
    PROPORTION_OF_MINES[DIFFICULTY_HARD]    = 0.25;
    PROPORTION_OF_MINES[DIFFICULTY_MEDIUM]  = 0.15;
    PROPORTION_OF_MINES[DIFFICULTY_EASY]    = 0.10;

    $scope.score          = 0;
    $scope.secondsElapsed = 0;
    $scope.movesMade      = 0; // the number of moves made
    $scope.boardSize      = 3; // this is the number of rows and columns.
    $scope.numMines       = 1; // the number of mines on the board
    $scope.numPositionsExposed = 0;

    // let's use this sample as a basis
    // -1 represents a mine
    $scope.boardElements = [
      [0,     0,  0],
      [1,     1,  0],
      [MINE,  1,  0]
    ];

    $scope.exposedView = [
      [false, false, false],
      [false, false, false],
      [false, false, false]
    ];

    /* Expose the element indexed by the parameters. Also
    kick off any post processing required after the element
    has been exposed.*/
    // function exposeElement(rowInd, colInd, exposeOnlyIfZero)
    function exposeElement(rowInd, colInd)
    {
      if(!$scope.exposedView[rowInd][colInd]){
        ++$scope.numPositionsExposed;
        // if(exposeOnlyIfZero && $scope.boardElements[rowInd][colInd] != 0){
        //   console.log("Will not expose because it's not 0.");
        //   return;
        // }
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
              // exposeElement(i, j);
          }
        }
      }
    };

    /* Determines whether the user has won or not. */
    function checkBoardState()
    {
      console.log("Number of positions exposed", $scope.numPositionsExposed);
      if($scope.numPositionsExposed == ($scope.boardSize * $scope.boardSize - $scope.numMines))
      {
        alert("You won!");
        exposeEverything();
      }
      // any post processing
    };

    /* This will randomly generate a "size" x "size" board with the given size.
    It will randomize a number of mines and place them. This will be a fraction
    of the size of the board (depending on the difficulty). */
    function generateBoard(size, difficulty){
      console.log("Playing with difficulty: ", difficulty);
      var numberOfElements = size*size;
      var numberOfMines = Math.ceil(PROPORTION_OF_MINES[difficulty] * numberOfElements);
      console.log("Number of mines -> ", numberOfMines);
      var gridWithMines = placeMinesRandomly(size, numberOfMines);
    }

    /* Places all the mines randomly on the board. */
    function placeMinesRandomly(size, numberOfMines){
      var gridWithMines = [];
      // generate a clean grid
      for(var i=0; i<size; i++){
        var row = [];
        for(var j=0; j<size; j++){
          row.push(0);
        }
        gridWithMines.push(row);
      }
      var numPlaced = 0;
      while(numPlaced != numberOfMines){
          break;
      }
      return gridWithMines;
    }

    /* Somewhat like a constructor for the controller. */
    function _init()
    {
      console.log("initialized home controller.");
      generateBoard(3, DIFFICULTY_EASY);
      console.log("Board Elements", $scope.boardElements);
      console.log("Hiding out all elements from the user.");

    };

    _init();
}]);
