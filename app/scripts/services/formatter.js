'use strict';

angular.module('vegewroApp')
  .factory('formatter', function() {

    function parseWeb(web, splitter) {
      var parsedWeb = web.split(splitter);
      if (parsedWeb.length > 1) {
        return parsedWeb[1];
      }
      return null;
    }
    
    return {
      web : function(web) {
        var formattedWeb = parseWeb(web, 'http://');
        if (formattedWeb === null) {
          formattedWeb = parseWeb(web, 'https://');
          if (formattedWeb === null) {
            formattedWeb = web;
          }
        }
        return formattedWeb;
      }
    };
  });