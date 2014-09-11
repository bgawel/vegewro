'use strict';

angular.module('vegewroApp', [
  'ngSanitize',
  'ngRoute',
  'ui.bootstrap',
  'firebase',
  'angularfire.firebase',
  'angularfire.login',
  'simpleLoginTools',
  'truncate'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/:lang?', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .run(['$route', '$rootScope', '$location', function ($route, $rootScope, $location) {
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
  }]);

// https://github.com/twbs/bootstrap/issues/12852
$(document).on('click','.navbar-collapse.in',function(e) {
  if ($(e.target).is('a') || $(e.target).is('span')) {
    $(this).collapse('hide');
  }
});