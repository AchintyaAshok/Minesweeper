'use strict';

var app = angular.module("minesweeper-app");
app.controller("HomeController", ['$scope', function($scope){

    const MINE = -1;

    $scope.score          = 0;
    $scope.secondsElapsed = 0;
    $scope.boardSize      = 3; // this is the number of rows and columns.

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
    function exposeElement(rowInd, colInd)
    {
      if(!$scope.exposedView[rowInd][colInd]){
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
          exposeElement(i, j);
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
      if($scope.boardElements[rowPos][valPos] == MINE){
        alert("Oh no! You hit a mine! You just lost.");
        exposeEverything();
        return;
      }
      exposeElement(rowPos, valPos);
      expandPosition(rowPos, valPos); // expand around this position if all adjacent elements are alread viewable
    };

    /* This will make all the itms around this position viewable if we are
    able to determine that a fenced area around this column is already visile. */
    function expandPosition(rowPos, valPos)
    {
      console.log("Expanding the area around the position", rowPos, valPos);
    }

    /* Somewhat like a constructor for the controller. */
    function _init()
    {
      console.log("initialized home controller.");
      console.log("Board Elements", $scope.boardElements);
      console.log("Hiding out all elements from the user.");
    };

    _init();
}]);
