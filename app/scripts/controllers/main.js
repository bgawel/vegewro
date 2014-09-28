'use strict';

angular.module('vegewroApp')
  .controller('MainCtrl', ['$scope', '$window', 'backend', 'locale', 'formatter', '$q', 'fb', 'googleMaps', 'news',
                           function ($scope, $window, backend, locale, formatter, $q, fb, googleMaps, news) {

  var map, config, markers = [], lastInfoBoxClicked, mapCenter;
  var fbFeeds = [];
  $scope.filters = [];
  $scope.addresses = {};
  $scope.places = {};
  $scope.feeds = [];
  $scope.feedsLoading = true;
  
  backend.data().then(function(data) {
    config = data.config;
    googleMaps.load(config.googleMapsVersion, config.googleMapsToken, $scope.lang).then(function() {
      createMap(data);
      readNews(data.news);
      loadFbLikeButton();
    });
  });
  
  function createMap(data) {
    createGoogleMap();
    createMapLegend(map);
    createMapMarkers(data.places);
  }
  
  function createGoogleMap() {
    map = googleMaps.newMap(document.getElementById('map'), config.mapOptions);
    mapCenter = map.getCenter();
    google.maps.event.addDomListener(window, 'resize', function() {
      map.setCenter(mapCenter);
    });
  }

  function createMapLegend() {
    var toggle = function() {
      var filterId = this.id;
      var markerMap = this.enabled ? map : null;
      angular.forEach(markers, function(marker) {
        if (marker.filterId === filterId) {
          marker.setMap(markerMap);
        }
      });
    };
    angular.forEach(config.filters, function(filter, filterName) {
      $scope.addresses[filterName] = [];
      $scope.filters.push({id: filterName, title: locale.valueFor(filter.title), iconUrl: filter.icon.url,
        enabled: true, toggle: toggle, order: -filter.order, type: filter.type});
    });
  }
  
  function makeMarkerTitle(place) {
    return place.name + (place.profile ? (' – ' + locale.valueFor(place.profile)) : '');
  }
  
  function createMarker(place, filterName) {
    var deferred = $q.defer();
    var filter = config.filters[filterName];
    googleMaps.findPosition(place.position, place.address).then(function(position) {
      var marker = googleMaps.newMarker({
        position: position,
        map: map,
        title: makeMarkerTitle(place),
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
  
  function createBoxText(place, marker) {
    var boxText = document.createElement('div');
    var image = '';
    if (place.image) {
      image = '<img class="logo" src="' + place.image.src + '" width="' + place.image.size.width +'" height="' +
        place.image.size.height + '" border="0" />';
    }
    var title = '<p class="title">' + makeMarkerTitle(place) + '</p>';
    var desc = '';
    if (place.desc) {
      desc = '<p class="desc">' + locale.valueFor(place.desc) + '</p>';
    }
    var address = '<p class="address">' + place.address + '</p>';
    var directions = '<p class="directions">(<a href="' + googleMaps.makeDirectionsLink(place, marker.position,
        config.zoomWhenDirections, $scope.lang) + '" target="_blank">' + $scope.i18n.directions + '</a>)</p>';
    var open = '';
    if (place.open) {
      open = '<p class="open">' + locale.valueFor(place.open) + '</p>';
    }
    var web = '';
    if (place.web) {
      web = '<p class="web"><a href="' + place.web + '" target="_blank">' + formatter.web(place.web) + '</a></p>';
    }
    var email = '';
    if (place.email) {
      email = '<p class="email"><a href="mailto:' + place.email + '">' + place.email + '</a></p>';
    }
    var phone = '';
    if (place.phone) {
      phone = '<p class="phone">' + place.phone + '</p>';
    }
    var desc2 = '';
    if (place.desc2) {
      desc2 = '<p class="desc2">' + locale.valueFor(place.desc2) + '</p>';
    }
    boxText.innerHTML = '<div class="pop_up_box_text pre"><div class="left">' + title + desc + address + directions +
      open + '</div><div class="right">' + web + email + phone + desc2 + image + '</div></div>';
    return boxText;
  }
  
  function addAddress(placeId, title, boxText, filterName, marker) {
    var showOnMap = function() {
      marker.infoBoxClicked();
      $window.scrollTo(0, 100);
    };
    var address = {title: title, boxText: boxText.innerHTML, showOnMap: showOnMap, placeId: placeId};
    $scope.addresses[filterName].push(address);
    if (!$scope.places[placeId]) {  // reference to the first marker; assumption: it's the most relevant
      $scope.places[placeId] = address;
    }
  }
  
  function createInfoBox(marker, boxText) {
    var infoBoxOptions = angular.copy(config.infoboxOptions);
    infoBoxOptions.content = boxText;
    var infoBox = googleMaps.newInfoBox(infoBoxOptions);
    var infoBoxClicked = function() {
      if (lastInfoBoxClicked) {
        lastInfoBoxClicked.close();
      }
      infoBox.open(map, marker);
      // Changes the z-index property of the marker to make the marker appear on top of other markers.
      marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
      googleMaps.setMapZoomIfSmallerThan(config.zoomWhenMarkerClicked);
      map.panTo(marker.getPosition());
      mapCenter = map.getCenter();
      lastInfoBoxClicked = infoBox;
    };
    marker.infoBoxClicked = infoBoxClicked;
    googleMaps.addMarkerClickedListener(marker, infoBoxClicked);
  }
  
  function addFbFeed(place) {
    if (place.fb) {
      fbFeeds.push({by: place.name, fbHref: fb.makeAccountLink(place.fb), placeId: place.id, fb: place.fb});
    }
  }
  
  function createMapMarkers(places) {
    angular.forEach(places, function(place) {
      if (place && place.id) {
        angular.forEach(place.filters, function(filterName) {
          try {
            createMarker(place, filterName).then(function(marker) {
              var boxText = createBoxText(place, marker);
              addAddress(place.id, marker.getTitle(), boxText, filterName, marker);
              createInfoBox(marker, boxText);
            });
          } catch (err) {
            console.log(err, 'Cannot create a marker for: ' + place);
          }
        });
        addFbFeed(place);
      }
    });
  }
  
  function readNews(newsSnapshot) {
    news.read(newsSnapshot, fbFeeds, config).then(function(feeds) {
      $scope.feeds = feeds;
      $scope.feedsLoading = false;
    });
  }
  
  function loadFbLikeButton() {
    fb.loadSdk(config.fbAppId, $scope.locale);
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
}]);