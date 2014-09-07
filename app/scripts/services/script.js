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
      
      googleMaps: function(lang) {
        var deferred = $q.defer();
        google.load('maps', '3', {
          'other_params' :
          'key=AIzaSyAq5XL42ERicqHYXKKmzPU7D6dVBAutA0U&sensor=false&language=' + lang,
          'callback' : deferred.resolve
        });
        return deferred.promise;
      }
    };
  }]);