'use strict';

angular.module('vegewroApp')
  .directive('focusOn', ['$timeout', function($timeout) {
    return {
      restrict: 'A',
      link: function(scope, elem, attrs) {
        var focusOn = attrs.focusOn;
        elem.bind('click', function() {
          $timeout(function() {
            $(focusOn).focus();
          }, 0, false);
        });
      }
    };
  }]);