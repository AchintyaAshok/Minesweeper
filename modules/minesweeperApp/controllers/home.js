'use strict';

var app = angular.module("minesweeper-app");
app.controller("HomeController", ['$scope', function($scope){

    $scope.score          = 0;
    $scope.secondsElapsed = 0;
    $scope.boardSize      = 3; // this is the number of rows and columns.
    // $scope.boardElements  = [
    //   ["1", "2", "x", "1", "2"],
    //   ["3", "2", "x", "1", "2"],
    //   ["1", "2", "x", "x", "2"],
    //   ["2", "2", "x", "1", "2"],
    //   ["1", "5", "x", "1", "2"]
    // ];

    // let's use this sample as a basis
    // -1 represents a mine
    $scope.boardElements = [
      [0, 0, 0],
      [1, 1, 0],
      [-1, 1, 0]
    ];

    $scope.exposedView = [
      [false, false, false],
      [false, true, false],
      [false, false, false]
    ];

    /* Checks the state of the board. If the position is not a mine, it will
    then evaluate the position. This means:
      1. It will display the value to the user
      2. Evaluate whether to expand the surrounding area of the element.
    */
    $scope.evaluatePosition = function(rowPos, valPos){
      console.log("Evaluating position:", {column: valPos, row: rowPos});

    };

    function _init(){
      console.log("initialized home controller.");
      console.log("Board Elements", $scope.boardElements);
    };

    _init();
}]);
