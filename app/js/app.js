'use strict';

// Declare app level module which depends on services, directives
angular.
  module('bucketListApp', ['ui','bucketListApp.services', 'bucketListApp.filters', 'bucketListApp.directives']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {templateUrl: 'list', controller: 'ListController'});
    $routeProvider.otherwise({redirectTo: '/'});
  }]).
  run(function($rootScope,$window,$document) {
        // src: http://pterkildsen.com/2012/12/12/angularjs-tips-and-tricks-broadcast-online-and-offline-status/
        $rootScope.online = navigator.onLine ? 'online' : 'offline';
        $rootScope.$apply();
        if ($window.addEventListener) {
            $window.addEventListener("online", function() {
                $rootScope.online = "online";
                $rootScope.$apply();
            }, true);
            $window.addEventListener("offline", function() {
                $rootScope.online = "offline";
                $rootScope.$apply();
            }, true);
        } else {
            $document.body.ononline = function() {
                $rootScope.online = "online";
                $rootScope.$apply();
            };
            $document.body.onoffline = function() {
                $rootScope.online = "offline";
                $rootScope.$apply();
            };
        }
    });