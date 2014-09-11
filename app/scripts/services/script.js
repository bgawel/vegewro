'use strict';

angular.module('vegewroApp')
  .factory('script', ['$q', function($q) {
    
    function getScript(url) {
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
    
    return {
      infoBox : function() {
        return getScript('ext_components/infobox/infobox_packed.js');
      },
    };
  }]);