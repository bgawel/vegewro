'use strict';

angular.module('vegewroApp')
  .factory('geoloc', ['googleMaps', function(googleMaps) {
    
    var lastGeoloc;
    
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
              console.log('Geolocation error occurred: ' + error);
              alert(i18n.geoerror + ': ' + error.message);
            },
            config.geolocOptions);
          };
          mapLocDiv.innerHTML = '<div class="map-loc"><a class="action" href="" ' +
            'onclick="window.locUser()"><img src="images/target.png"/></a></div>';
          googleMaps.putOnMap(google.maps.ControlPosition.RIGHT_BOTTOM, mapLocDiv);
        } else {
          console.log('Geolocation is not supported');
        }
      }
    };
  }]);