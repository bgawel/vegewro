'use strict';

angular.module('vegewroApp')
  .factory('backend', ['syncData', function(syncData) {
    return {
      data : function() {
        return syncData().$asObject().$loaded();
      },
      config : function() {
        return syncData('config').$asObject().$loaded();
      },
      places : function() {
        return syncData('places').$asObject().$loaded();
      }
    };
  }]);