'use strict';

angular.module('vegewroApp')
  .factory('googleMaps', ['$q', 'script', function($q, script) {
    
    var map, geocoder;
   
    function infoBox() {
      return script.getScript('ext_components/infobox/1.infobox.min.js');
    }
    
    return {
      load: function(googleMapsVersion, googleMapsToken, lang) {
        var deferred = $q.defer();
        google.load('maps', googleMapsVersion, {
          'other_params' :
          'key=' + googleMapsToken + '&sensor=false&language=' + lang,
          'callback' : function() {
            infoBox().then(function() {
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
      
      newLatLng: function(lat, lng) {
        return new google.maps.LatLng(lat, lng);
      },
      
      makeDirectionsLink: function(directionsHints, position, zoom, lang) {
        if (directionsHints.dirLink) {
          return directionsHints.dirLink.replace('{{zoom}}', zoom + 'z') + '?hl=' + lang;
        }
        var lat = position.lat();
        var lng = position.lng();
        var prefix = 'https://www.google.com/maps/dir//';
        var address = directionsHints.address.replace(new RegExp('\\/', 'g'), '%2F');
        var place;
        if (directionsHints.dirPosition) {
          place = address;
        } else {
          place = directionsHints.name + ',' + address;
        }
        return prefix + place + '/@' + lat + ',' + lng + ',' + zoom + 'z?hl=' + lang;
      },
      
      newInfoBox: function(infoBoxOptions) {
        return new InfoBox(infoBoxOptions);
      },
      
      putOnMap: function(where, what) {
        map.controls[where].push(what);
      },
      
      addListener: function(object, event, callback) {
        google.maps.event.addListener(object, event, callback);
      },
      
      triggerEvent: function(object, event) {
        google.maps.event.trigger(object, event);
      }
    };
  }]);