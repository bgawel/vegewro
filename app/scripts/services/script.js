'use strict';

angular.module('vegewroApp')
  .factory('script', ['$q', function($q) {

    return {
      getScript : function(url) {
        var deferred = $q.defer();
        $.ajax({
          url: url,
          dataType: 'script',
          cache: true,
          success: function() {
            deferred.resolve('loaded');
          },
          error: function(jqXHR, textStatus, errorThrown) {
            deferred.reject(textStatus + ': ' + errorThrown);
          }
        });
        return deferred.promise;
      }
    };
  }]);