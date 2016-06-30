'use strict';

var app = angular.module("minesweeper-app");
app.controller("HomeController", ['$scope', function($scope){

    $scope.score = 0;
    $scope.secondsElapsed = 0;

    function _init(){
      console.log("initialized home controller.");
    }

    _init();
}]);
