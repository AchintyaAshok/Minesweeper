'use strict';

// just let me know that it's started up
console.log("initializing minesweeper app.");

var templateDir = "views/";

var app = angular.module("minesweeper-app", [
  'ngRoute'
]).config(function($routeProvider){
  $routeProvider.when('/', {
      controller:   'HomeController',
      templateUrl:  templateDir + 'home.html'
  })
  .otherwise({
      controller:   'HomeController',
      templateUrl:  templateDir + 'home.html'
  });
});
