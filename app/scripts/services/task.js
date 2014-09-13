'use strict';

angular.module('vegewroApp')
  .factory('task', ['$timeout', function($timeout) {

    return {
      runBackgroundTask : function(task) {
        $timeout(function() {
          task();
        }, 10);
      }
    };
  }]);