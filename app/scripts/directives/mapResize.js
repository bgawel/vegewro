'use strict';

angular.module('vegewroApp')
  .directive('mapResize', function() {
    return {
      restrict: 'A',
      link: function(scope, elem, attrs) {
        var offsetTop = attrs.offsetTop ? attrs.offsetTop : 60;
        var resizeDelay = attrs.resizeDelay ? attrs.resizeDelay : 250;
        //$(elem).css('height', $(window).height() - offsetTop);
        
        var delay = (function(){
          var timer = 0;
          return function(callback, ms){
            clearTimeout (timer);
            timer = setTimeout(callback, ms);
          };
        })();
        
        $(window).resize(function() {
          delay(function(){
            $(elem).css('height', $(window).height() - offsetTop);
          }, resizeDelay);
        });
      }
    };
  });