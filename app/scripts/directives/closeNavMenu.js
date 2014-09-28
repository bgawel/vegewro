'use strict';

angular.module('vegewroApp')
  .directive('closeNavMenu', function() {
    return {
      restrict: 'A',
      link: function() {
        // https://github.com/twbs/bootstrap/issues/12852
        $(document).on('click', '.navbar-collapse.in', function(e) {
          if ($(e.target).is('a') || $(e.target).is('span')) {
            $(this).collapse('hide');
          }
        });
      }
    };
  });