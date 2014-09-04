'use strict';

angular.module('vegewroApp')
  .factory('backend', ['syncData', function(syncData) {
    return {
      config : function() {
        return syncData('config').$asObject().$loaded();
      },
      places : function() {
        return syncData('places').$asObject().$loaded();
      }
    };
  }]);