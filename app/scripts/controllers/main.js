'use strict';

angular.module('vegewroApp')
  .controller('MainCtrl', ['$scope', '$window', 'backend', 'locale', 'formatter', '$q', 'fb', 'googleMaps',
                           function ($scope, $window, backend, locale, formatter, $q, fb, googleMaps) {

  var map, config, markers = [], lastInfoBoxClicked;
  var fbFeeds = {check:[], fetched:[]};
  $scope.filters = [];
  $scope.addresses = {};
  $scope.places = {};
  $scope.feeds = [];
  $scope.feedsLoading = true;
  
  backend.data().then(function(data) {
    Firebase.goOffline(); // release connection
    config = data.config;
    googleMaps.load(config.googleMapsVersion, config.googleMapsToken, $scope.lang).then(function() {
      createMap(data);
    });
  });
  
  function createMap(data) {
    map = googleMaps.newMap(document.getElementById('map'), config.mapOptions);
    createMapLegend(map);
    createMapMarkers(data.places);
    readNews(data.news);
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
    var directions = '<p class="directions">(<a href="' + googleMaps.makeDirectionsLink(marker.position,
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
    boxText.innerHTML = '<div class="pop_up_box_text pre"><div class="left">' + title + desc + address + directions +
      open + '</div><div class="right">' + web + email + phone + image + '</div></div>';
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
    googleMaps.newInfoBox(infoBoxOptions).then(function(infoBox) {
      var infoBoxClicked = function() {
        if (lastInfoBoxClicked) {
          lastInfoBoxClicked.close();
        }
        infoBox.open(map, marker);
        // Changes the z-index property of the marker to make the marker appear on top of other markers.
        marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
        googleMaps.setMapZoomIfSmallerThan(config.zoomWhenMarkerClicked);
        // Do not set the marker to be the center of the map; does not work well if the map is not fully visible 
        // map.setCenter(marker.getPosition());
        lastInfoBoxClicked = infoBox;
      };
      marker.infoBoxClicked = infoBoxClicked;
      googleMaps.addMarkerClickedListener(marker, infoBoxClicked);
    });
  }
  
  function addFbFeed(place) {
    if (place.fb) {
      fbFeeds.check.push({by: place.name, fbHref: fb.makeProfileLink(place.fb), placeId: place.id});
      fbFeeds.fetched.push(fb.fetchLastPosts(place.fb, config.fbToken, config.fbPostsNoOlderThan));
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
  
  function readFbFeeds() {
    return $q.all(fbFeeds.fetched).then(function(results) {
      angular.forEach(fbFeeds.check, function(feed, index) {
        var fbPosts = results[index];
        if (fbPosts.length > 0) {
          feed.time = new Date(fbPosts[0].created_time);
          feed.messages = fbPosts;
          $scope.feeds.push(feed);
        }
      });
    });
  }
  
  function readFixedFeeds(fixedFeeds) {
    angular.forEach(fixedFeeds, function(feed) {
      feed.time = new Date(feed.time);
      feed.fixed = true;
      $scope.feeds.push(feed);
    });
  }
  
  function readNews(fixedFeeds) {
    readFbFeeds().then(function() {
      readFixedFeeds(fixedFeeds);
      $scope.feedsLoading = false;
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
}]);