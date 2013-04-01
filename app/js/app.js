'use strict';

// Declare app level module which depends on services, directives
angular.
  module('bucketListApp', ['ui','bucketListApp.services', 'bucketListApp.filters', 'bucketListApp.directives']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {templateUrl: 'list', controller: 'ListController'});
    $routeProvider.otherwise({redirectTo: '/'});
  }]);