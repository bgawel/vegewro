'use strict';

angular.module('vegewroApp', [
  'ngSanitize',
  'ngRoute',
  'ui.bootstrap',
  'firebase',
  'angularfire.firebase',
  'angularfire.login',
  'simpleLoginTools',
  'truncate',
  'angucomplete',
])
  .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider
      .when('/:lang?', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  }])
  .run(['$route', '$rootScope', '$location', '$timeout', '$anchorScroll', '$window',
        function ($route, $rootScope, $location, $timeout, $anchorScroll, $window) {
    // see http://joelsaupe.com/programming/angularjs-change-path-without-reloading/
    function enhanceLocationPath() {
      var original = $location.path;
      $location.path = function (path, reload) {
        if (reload === false) {
          var lastRoute = $route.current;
          var un = $rootScope.$on('$locationChangeSuccess', function () {
              $route.current = lastRoute;
              un();
            });
        }
        return original.apply($location, [path]);
      };
    }
    enhanceLocationPath();
    
    $rootScope.scrollTo = function(hash) {
      $timeout(function() {
        var old = $location.hash();
        $location.hash(hash);
        $anchorScroll();
        $location.hash(old);  //reset to old to keep any additional routing logic from kicking in
      }, 50, false);
    };
    
    $rootScope.reload = function() {
      $timeout(function() { $window.location.reload(); }, 0, false);
    };
  }]);