'use strict';

angular.module('vegewroApp')
  .directive('mapResize', function() {
    return {
      restrict: 'A',
      link: function(scope, elem, attrs) {
        var offsetTop = attrs.offsetTop ? attrs.offsetTop : 60;
        var resizeDelay = attrs.resizeDelay ? attrs.resizeDelay : 250;
        //$(elem).css('height', $(window).height() - offsetTop);
        
        var map, mapCenter;
        
        var delay = (function(){
          var timer = 0;
          return function(callback, ms){
            clearTimeout (timer);
            timer = setTimeout(callback, ms);
          };
        })();
        
        var onResizeCompleted = function() {
          $(elem).css('height', $(window).height() - offsetTop);
          google.maps.event.trigger(map, 'resize'); // http://stackoverflow.com/questions/10197128/google-maps-api-v3-not-rendering-competely-on-tabbed-page-using-twitters-bootst
          map.setCenter(mapCenter);
          mapCenter = undefined;
        };
        
        $(window).resize(function() {
          map = scope.map;
          if (!mapCenter) {
            mapCenter = map.getCenter();
          }
          delay(onResizeCompleted, resizeDelay);
        });
      }
    };
  });