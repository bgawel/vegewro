'use strict';

angular.module('vegewroApp')
  .factory('googleMaps', ['$q', 'script', function($q, script) {
    
    var map, geocoder;
        
    return {
      load: function(googleMapsVersion, googleMapsToken, lang) {
        var deferred = $q.defer();
        google.load('maps', googleMapsVersion, {
          'other_params' :
          'key=' + googleMapsToken + '&sensor=false&language=' + lang,
          'callback' : function() {
            script.infoBox().then(function() {
              deferred.resolve();
            });
          }
        });
        return deferred.promise;
      },
      
      newMap: function(domElement, mapOptions) {
        map = new google.maps.Map(domElement, mapOptions);
        geocoder = new google.maps.Geocoder();
        return map;
      },
      
      findPosition: function(position, address) {
        var deferred = $q.defer();
        if (position) {
          deferred.resolve(position);
        } else {
          geocoder.geocode({'address': address, 'location': map.getCenter()}, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
              deferred.resolve(results[0].geometry.location);
            } else {
              deferred.reject('Geocode was not successful for the following reason: ' + status);
            }
          });
        }
        return deferred.promise;
      },
      
      setMapZoomIfSmallerThan: function(zoom) {
        var currentZoom = map.getZoom();
        if (currentZoom < zoom) {
          map.setZoom(zoom);
        }
      },
      
      newMarker: function(markerOptions) {
        return new google.maps.Marker(markerOptions);
      },
      
      makeDirectionsLink: function(position, zoom, lang) {
        var lat = position.lat();
        var lng = position.lng();
        return 'https://www.google.com/maps/dir//' + lat + ',' + lng + '/@' + lat + ',' + lng + ',' + zoom + 'z?hl=' +
          lang;
      },
      
      newInfoBox: function(infoBoxOptions) {
        return new InfoBox(infoBoxOptions);
      },
      
      addMarkerClickedListener: function(marker, infoBoxClicked) {
        google.maps.event.addListener(marker, 'click', infoBoxClicked);
      }
    };
  }]);