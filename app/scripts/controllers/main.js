'use strict';

angular.module('vegewroApp')
  .controller('MainCtrl', ['$scope', '$window', '$timeout', '$location', '$anchorScroll', 'backend', 'locale',
                           'formatter', '$q', 'script', '$routeParams', 'i18n',
                           function ($scope, $window, $timeout, $location, $anchorScroll, backend, locale, formatter,
                               $q, script, $routeParams, i18n) {

  var geocoder, map, config, markers = [];
  
  function changePathForLang(lang) {
    $scope.i18n = i18n[lang];
    $location.path('/' + lang, false);
  }
  
  var lang = $scope.lang = locale.getLang($routeParams.lang);
  changePathForLang(lang);
  script.googleMaps(lang).then(function() {
    createMap();
  });
  
  $scope.changeLang = function(lang) {
    changePathForLang(lang);
    $timeout(function() { $window.location.reload(); }, 0);
  };
  
  function createMap() {
    backend.data().then(function(data) {
      Firebase.goOffline(); // release connection
      config = data.config;
      map = new google.maps.Map(document.getElementById('map'), config.mapOptions);
      createMapLegend(map);
      createMapMarkers(data.places);
    });
  }
  
  function setZoomWhenMarkerClicked() {
    var currentZoom = map.getZoom();
    if (currentZoom < config.zoomWhenMarkerClicked) {
      map.setZoom(config.zoomWhenMarkerClicked);
    }
  }
  
  function findPosition(place) {
    var deferred = $q.defer();
    if (place.position) {
      deferred.resolve(place.position);
    } else {
      geocoder.geocode({'address': place.address, 'location': map.getCenter()}, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          deferred.resolve(results[0].geometry.location);
        } else {
          deferred.reject('Geocode was not successful for the following reason: ' + status);
        }
      });
    }
    return deferred.promise;
  }
  
  function createMarker(place, filterName) {
    var deferred = $q.defer();
    var filter = config.filters[filterName];
    findPosition(place).then(function(position) {
      var marker = new google.maps.Marker({
        position: position,
        map: map,
        title: locale.valueFor(place.title, lang),
        icon: filter.icon,
        shape: filter.shape,
        zIndex: filter.zIndex,
        filterId: filterName
      });
      markers.push(marker);
      deferred.resolve(marker);
    }, function(error) {
      throw error;
    });
    return deferred.promise;
  }
  
  function makeGoogleMapsDirections(position) {
    var lat = position.lat();
    var lng = position.lng();
    return 'https://www.google.com/maps/dir//' + lat + ',' + lng + '/@' + lat + ',' + lng + ',' +
      config.zoomWhenDirections + 'z?hl=' + lang;
  }
  
  function createBoxText(place, marker) {
    var boxText = document.createElement('div');
    var image = '';
    if (place.image !== undefined) {
      image = '<img src="' + place.image.src + '" width="' + place.image.size.width +'" height="' +
        place.image.size.height + '" border="0" />';
    }
    var title = '<p class="title">' + locale.valueFor(place.title, lang) + '</p>';
    var desc = '';
    if (place.desc !== undefined) {
      desc = '<p class="desc">' + locale.valueFor(place.desc, lang) + '</p>';
    }
    var address = '<p class="address">' + place.address + '</p>';
    var directions = '<p class="directions">(<a href="' + makeGoogleMapsDirections(marker.position) +
      '" target="_blank">' + $scope.i18n.directions + '</a>)</p>';
    var open = '';
    if (place.open !== undefined) {
      open = '<p class="open">' + locale.valueFor(place.open, lang) + '</p>';
    }
    var web = '';
    if (place.web !== undefined) {
      web = '<p class="web clearfix"><a href="' + place.web + '" target="_blank">' + formatter.web(place.web) + '</a></p>';
    } else {
      web = '<p class="web clearfix"/>';
    }
    var email = '';
    if (place.email) {
      email = '<p class="email"><a href="mailto:' + place.email + '">' + place.email + '</a></p>';
    }
    var phone = '';
    if (place.phone !== undefined) {
      phone = '<p class="phone">' + place.phone + '</p>';
    }
    boxText.innerHTML = '<div class="pop_up_box_text pre"><div class="left">' + title + desc + address + directions +
      open + '</div><div class="right">' + image + web + email + phone + '</div></div>';
    return boxText;
  }
   
  function createInfoBox(marker, boxText) {
    var infoBoxOptions = angular.copy(config.infoboxOptions);
    infoBoxOptions.content = boxText;
    var infoBox = new InfoBox(infoBoxOptions);
    var infoBoxClicked = function() {
      infoBox.open(map, marker);
      // Changes the z-index property of the marker to make the marker appear on top of other markers.
      marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
      setZoomWhenMarkerClicked();
      // Sets the marker to be the center of the map. 
      //map.setCenter(marker.getPosition());
    };
    marker.infoBoxClicked = infoBoxClicked;
    google.maps.event.addListener(marker, 'click', infoBoxClicked);
  }
  
  function addAddress(title, boxText, filterName, marker) {
    var showOnMap = function() {
      marker.infoBoxClicked();
      $window.scrollTo(0, 100);
    };
    $scope.addresses[filterName].push({title: title, boxText: boxText.innerHTML, showOnMap: showOnMap});
  }
  
  function createMapMarkers(places) {
    script.infoBox().then(function(results) {
      geocoder = new google.maps.Geocoder();
      angular.forEach(places, function(place) {
        if (place !== null && place.id) {
          angular.forEach(place.filters, function(filterName) {
            try {
              createMarker(place, filterName).then(function(marker) {
                var boxText = createBoxText(place, marker);
                addAddress(locale.valueFor(place.title, lang), boxText, filterName, marker);
                createInfoBox(marker, boxText);
              });
            } catch (err) {
              console.log(err, 'Cannot create a marker for: ' + place);
            }
          });
        }
      });
    });
  }
  
  function createMapLegend() {
    $scope.filters = [];
    $scope.addresses = {};
    angular.forEach(config.filters, function(filter, filterName) {
      $scope.addresses[filterName] = [];
      function toggle() {
        var filterId = this.id;
        var markerMap = this.enabled ? map : null;
        angular.forEach(markers, function(marker) {
          if (marker.filterId === filterId) {
            marker.setMap(markerMap);
          }
        });
      }
      $scope.filters.push({id: filterName, title: locale.valueFor(filter.title, lang), iconUrl: filter.icon.url,
        enabled: true, toggle: toggle, order: -filter.order, type: filter.type});
    });
  }
  
  $scope.enableFilters = function(type) {
    angular.forEach($scope.filters, function(filter) {
      filter.enabled = (filter.type === type);
      filter.toggle();
    });
  };
  
  $scope.enableAllFilters = function(enable) {
    angular.forEach($scope.filters, function(filter) {
      filter.enabled = enable;
      filter.toggle();
    });
  };
    
  $scope.scrollTo = function(hash) {
    $timeout(function() {
      var old = $location.hash();
      console.log(hash);
      $location.hash(hash);
      $anchorScroll();
      $location.hash(old);  //reset to old to keep any additional routing logic from kicking in
    }, 50);
  };
  
  $scope.reload = function() {
    $timeout(function() { $window.location.reload(); }, 0);
  };
}]);