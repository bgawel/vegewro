'use strict';

angular.module('vegewroApp')
  .filter('shopFilter', ['backend', function(backend) {
    return function(shops, arg) {
      if (arg.online && arg.stationary) {
        return shops;
      }
      var out = [];
      var type = arg.online ? backend.ONLINE_SHOP : arg.stationary ? backend.STATIONARY_SHOP : 1;
      angular.forEach(shops, function(shop) {
        /*jslint bitwise: true*/
        if ((shop.type & type) === type) {
          out.push(shop);
        }
      });
      return out;
    };
  }]);