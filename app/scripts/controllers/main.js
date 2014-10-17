'use strict';

angular.module('vegewroApp')
  .controller('MainCtrl', ['$scope', '$window', 'backend', 'locale', 'formatter', '$q', 'fb', 'googleMaps', 'news',
                           'geoloc',
                           function ($scope, $window, backend, locale, formatter, $q, fb, googleMaps, news, geoloc) {

  var map, config, markers = [], lastInfoBoxClicked;
  var fbFeeds = [];
  $scope.filters = {$asArray:[]};
  $scope.addresses = {};
  $scope.places = {};
  $scope.feeds = [];
  $scope.feedsLoading = true;
  $scope.searchable = [];
  $scope.selected = {};
  
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
  
  function createFiltersOnGoogleMap() {
    var mapFiltersDiv = document.createElement('div');
    var scrollTo = '$(\'html,body\').animate({scrollTop:$(\'#filtersAnchor\').offset().top},50);';
    mapFiltersDiv.innerHTML = '<div class="map-filters action-mobile"><span class="action" onclick="' + scrollTo +
      '">' + $scope.i18n.filters + '</span></div>';
    googleMaps.putOnMap(google.maps.ControlPosition.RIGHT_TOP, mapFiltersDiv);
  }
  
  function createGoogleMap() {
    $scope.map = map = googleMaps.newMap(document.getElementById('map'), config.mapOptions);
    createFiltersOnGoogleMap();
    geoloc.onGoogleMap(map, config, $scope.i18n);
    googleMaps.addListener(map, 'click', function() {
      $('input.search-query').blur();
    });
  }

  var setAllMarkers = function(onMap) {
    angular.forEach(markers, function(marker) {
      marker.setMap(onMap);
    });
  };
  
  var exclusiveMode = setAllMarkers;
  
  function createMapLegend() {
    var toggle = function(toggledByUser) {
      if (exclusiveMode && toggledByUser) {
        exclusiveMode(null);
      }
      exclusiveMode = undefined;
      var filterId = this.id;
      var markerMap = this.enabled ? map : null;
      var numberOfEnabled = 0;
      angular.forEach(markers, function(marker) {
        if (marker.filterId === filterId) {
          marker.setMap(markerMap);
        }
        if (marker.getMap() !== null) {
          ++numberOfEnabled;
        }
      });
      if (toggledByUser && !numberOfEnabled) {
        setAllMarkers(map);
        exclusiveMode = setAllMarkers;
      }
    };
    angular.forEach(config.filters, function(filter, filterName) {
      $scope.addresses[filterName] = [];
      var legend = {id: filterName, title: locale.valueFor(filter.title), iconUrl: filter.icon.url, enabled: false,
          toggle: toggle, order: -filter.order, type: filter.type, htmlTitle: locale.valueFor(filter.htmlTitle)};
      $scope.filters[filterName] = legend;
      $scope.filters.$asArray.push(legend);
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
      marker.filterName = filterName;
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
    var typeText = '';
    if (place.type) {
      if (place.type === backend.ONLINE_SHOP) {
        typeText = $scope.i18n.onlyOnlineShop;
      } else if (place.type === backend.STATIONARY_AND_ONLINE_SHOP) {
        typeText = $scope.i18n.stationaryAndOnlineShop;
      }
    }
    var descText = '';
    if (place.desc) {
      descText = typeText ? '. ' : '';
      descText += locale.valueFor(place.desc);
    }
    var desc = '';
    if (typeText || descText) {
      desc = '<p class="desc">' + typeText + descText + '</p>';
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
      web = '<p class="web" title="' + place.web + '"><a href="' + place.web + '" target="_blank">' +
        formatter.web(place.web) + '</a></p>';
    }
    var email = '';
    if (place.email) {
      email = '<p class="email" title="' + place.email + '"><a href="mailto:' + place.email + '">' + place.email +
        '</a></p>';
    }
    var phone = '';
    if (place.phone) {
      phone = '<p class="phone">' + place.phone + '</p>';
    }
    var desc2 = '';
    if (place.desc2) {
      desc2 = '<p class="desc2">' + locale.valueFor(place.desc2) + '</p>';
    }
    boxText.innerHTML = '<div class="pop_up_box_text"><div class="left">' + title + desc + address + directions +
      open + '</div><div class="right">' + web + email + phone + desc2 + image + '</div></div>';
    return boxText;
  }
  
  function addPlace(placeId, address, marker) {
    var place = $scope.places[placeId];
    if (!place) {
      place = $scope.places[placeId] = address;
      place.markers = [];
    }
    place.markers.push(marker);
  }
  
  function addAddress(place, title, boxText, filterName, addressMarker) {
    var showOnMap = function() {
      addressMarker.infoBoxClicked();
      angular.forEach(this.markers, function(marker) {
        marker.setMap(map);
      });
      $window.scrollTo(0, 0);
    };
    var address = {title: title, boxText: boxText.innerHTML, showOnMap: showOnMap, placeId: place.id, type: place.type};
    $scope.addresses[filterName].push(address);
    addPlace(place.id, address, addressMarker);
    return address;
  }
  
  function closeInfoBox(infoBox) {
    if (infoBox) {
      infoBox.close();
      googleMaps.triggerEvent(infoBox, 'closeclick');
    }
  }
  
  function createInfoBox(marker, boxText, address) {
    var infoBoxOptions = angular.copy(config.infoboxOptions);
    infoBoxOptions.content = boxText;
    var infoBox = googleMaps.newInfoBox(infoBoxOptions);
    var infoBoxClicked = function() {
      closeInfoBox(lastInfoBoxClicked);
      infoBox.open(map, marker);
      // Changes the z-index property of the marker to make the marker appear on top of other markers.
      marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
      googleMaps.setMapZoomIfSmallerThan(config.zoomWhenMarkerClicked);
      map.panTo(marker.getPosition());
      lastInfoBoxClicked = infoBox;
    };
    var infoBoxClosed = function() {
      if (!exclusiveMode) {
        angular.forEach(address.markers, function(marker) {
          if (!$scope.filters[marker.filterName].enabled) {
            marker.setMap(null);
          }
        });
      }
    };
    marker.infoBoxClicked = infoBoxClicked;
    googleMaps.addListener(marker, 'click', infoBoxClicked);
    googleMaps.addListener(infoBox, 'closeclick', infoBoxClosed);
  }
  
  function addToSearchable(place) {
    var profile = place.profile ? locale.valueFor(place.profile) : '';
    $scope.searchable.push({name: place.name, profile: profile, address: place.address, id: place.id});
  }
  
  function addFbFeed(place) {
    if (place.fb) {
      fbFeeds.push({by: place.name, fbHref: fb.makeAccountLink(place.fb), placeId: place.id, fb: place.fb,
        type: 'map'});
    }
  }
  
  function createMapMarkers(places) {
    angular.forEach(places, function(place) {
      if (place && place.id) {
        angular.forEach(place.filters, function(filterName) {
          try {
            createMarker(place, filterName).then(function(marker) {
              var boxText = createBoxText(place, marker);
              var address = addAddress(place, marker.getTitle(), boxText, filterName, marker);
              createInfoBox(marker, boxText, address);
            });
          } catch (err) {
            console.log(err, 'Cannot create a marker for: ' + place);
          }
        });
        addToSearchable(place);
        addFbFeed(place);
      }
    });
  }
  
  function readNews(newsItems) {
    angular.forEach(newsItems.fixedFbFeeds, function(fixedFbFeed) {
      fixedFbFeed.fbHref = fb.makeAccountLink(fixedFbFeed.fb);
      fixedFbFeed.type = 'statFb';
      fbFeeds.push(fixedFbFeed);
    });
    news.read(newsItems, fbFeeds, config).then(function(feeds) {
      $scope.feeds = feeds;
      $scope.feedsLoading = false;
    });
  }
  
  function loadFbLikeButton() {
    fb.loadSdk(config.fbAppId, $scope.locale);
  }
  
  $scope.enableFilters = function(type) {
    angular.forEach($scope.filters.$asArray, function(filter) {
      filter.enabled = (filter.type === type);
      filter.toggle();
    });
  };
  
  $scope.enableAllFilters = function(enable) {
    angular.forEach($scope.filters.$asArray, function(filter) {
      filter.enabled = enable;
      filter.toggle();
    });
    if (!enable) {
      setAllMarkers(map);
      exclusiveMode = setAllMarkers;
    }
  };
  
  $scope.$watch('selected.place', function(newVal, oldVal) {
    if (newVal !== oldVal && newVal) {
      $scope.places[newVal.originalObject.id].showOnMap();
    }
  });
}]);