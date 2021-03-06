'use strict';

angular.module('vegewroApp')
  .factory('backend', ['syncData', function(syncData) {
    return {
      data : function() {
        return syncData().$asObject().$loaded().then(function(data) {
          Firebase.goOffline(); // release connection
          return data;
        });
      },
      
      save : function(node, data) {
        Firebase.goOnline();
        syncData(node).$set(data).then(function() {
          Firebase.goOffline();
        }, function(error) {
          Firebase.goOffline();
          console.log('Data could not be saved: ' + error);
        });
      },

      STATIONARY_SHOP : 2,
      ONLINE_SHOP : 4,
      STATIONARY_AND_ONLINE_SHOP : 6
    };
  }]);