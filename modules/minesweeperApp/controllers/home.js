'use strict';

var app = angular.module("minesweeper-app");
app.controller("HomeController", ['$scope', function($scope){

    $scope.score          = 0;
    $scope.secondsElapsed = 0;
    $scope.boardSize      = 5; // this is the number of rows and columns.
    $scope.boardElements  = [
      ["1", "2", "x", "1", "2"],
      ["3", "2", "x", "1", "2"],
      ["1", "2", "x", "x", "2"],
      ["2", "2", "x", "1", "2"],
      ["1", "5", "x", "1", "2"]
    ];

    function _init(){
      console.log("initialized home controller.");
      console.log("Board Elements", $scope.boardElements);
    };

    _init();
}]);
