'use strict';

angular.module('vegewroApp')
  .factory('geoloc', ['googleMaps', function(googleMaps) {
    
    var lastGeoloc;
    
    function handleError(error, i18n) {
      var message;
      switch(error.code) {
        case error.PERMISSION_DENIED:
          message = i18n.gePermissionDenied;
          break;
        case error.POSITION_UNAVAILABLE:
          message = i18n.gePositionUnavailable;
          break;
        case error.TIMEOUT:
          message = i18n.geTimeout;
          break;
        case error.UNKNOWN_ERROR:
          message = i18n.geoerror + ': ' + i18n.geUnknownError;
          break;
      }
      console.log('Geolocation error occurred: ' + error);
      alert(message);
    }
    
    return {
      onGoogleMap : function(map, config, i18n) {
        if (navigator.geolocation) {
          var mapLocDiv = document.createElement('div');
          window.locUser = function() {
            navigator.geolocation.getCurrentPosition(function(position) {
              if (lastGeoloc) {
                lastGeoloc.setMap(null);
              }
              var userCoords = googleMaps.newLatLng(position.coords.latitude, position.coords.longitude);
              googleMaps.setMapZoomIfSmallerThan(config.zoomWhenMarkerClicked);
              lastGeoloc = googleMaps.newMarker({
                position: userCoords,
                map: map,
                title: i18n.youHere,
                icon: 'images/rabbit.png'
              });
              map.panTo(userCoords);
            }, function(error) {
              handleError(error, i18n);
            },
            config.geolocOptions);
          };
          mapLocDiv.innerHTML = '<div class="map-loc"><img class="action" src="images/target.png" ' +
            'onclick="window.locUser()"/></div>';
          googleMaps.putOnMap(google.maps.ControlPosition.RIGHT_BOTTOM, mapLocDiv);
        } else {
          console.log('Geolocation is not supported');
        }
      }
    };
  }]);