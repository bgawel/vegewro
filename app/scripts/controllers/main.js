'use strict';

angular.module('vegewroApp')
  .controller('MainCtrl', ['$scope', '$window', '$timeout', '$location', '$anchorScroll', 'backend', 'locale',
                           'formatter', '$q', 'script', '$routeParams', 'i18n', 'fb',
                           function ($scope, $window, $timeout, $location, $anchorScroll, backend, locale, formatter,
                               $q, script, $routeParams, i18n, fb) {

  var geocoder, map, config, markers = [], lastInfoBoxClicked;
  var fbPosts = {check:[], fetched:[]};
  $scope.filters = [];
  $scope.addresses = {};
  $scope.places = {};
  $scope.posts = [];
  $scope.postsLoading = true;
  
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
      createMapMarkers(data.places).then(function() {
        readNews(data.news);
      });
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
  
  function makeTitle(place) {
     return place.name + (place.profile ? (' – ' + locale.valueFor(place.profile, lang)) : '');
  }
  
  function createMarker(place, filterName) {
    var deferred = $q.defer();
    var filter = config.filters[filterName];
    findPosition(place).then(function(position) {
      var marker = new google.maps.Marker({
        position: position,
        map: map,
        title: makeTitle(place),
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
    if (place.image) {
      image = '<img class="logo" src="' + place.image.src + '" width="' + place.image.size.width +'" height="' +
        place.image.size.height + '" border="0" />';
    }
    var title = '<p class="title">' + makeTitle(place) + '</p>';
    var desc = '';
    if (place.desc) {
      desc = '<p class="desc">' + locale.valueFor(place.desc, lang) + '</p>';
    }
    var address = '<p class="address">' + place.address + '</p>';
    var directions = '<p class="directions">(<a href="' + makeGoogleMapsDirections(marker.position) +
      '" target="_blank">' + $scope.i18n.directions + '</a>)</p>';
    var open = '';
    if (place.open) {
      open = '<p class="open">' + locale.valueFor(place.open, lang) + '</p>';
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
   
  function createInfoBox(marker, boxText) {
    var infoBoxOptions = angular.copy(config.infoboxOptions);
    infoBoxOptions.content = boxText;
    var infoBox = new InfoBox(infoBoxOptions);
    var infoBoxClicked = function() {
      if (lastInfoBoxClicked) {
        lastInfoBoxClicked.close();
      }
      infoBox.open(map, marker);
      // Changes the z-index property of the marker to make the marker appear on top of other markers.
      marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
      setZoomWhenMarkerClicked();
      // Do not set the marker to be the center of the map; does not work well if the map is not fully visible 
      //map.setCenter(marker.getPosition());
      lastInfoBoxClicked = infoBox;
    };
    marker.infoBoxClicked = infoBoxClicked;
    google.maps.event.addListener(marker, 'click', infoBoxClicked);
  }
  
  function addAddress(placeId, title, boxText, filterName, marker) {
    var showOnMap = function() {
      marker.infoBoxClicked();
      $window.scrollTo(0, 100);
    };
    var address = {title: title, boxText: boxText.innerHTML, showOnMap: showOnMap, placeId: placeId};
    $scope.addresses[filterName].push(address);
    if (!$scope.places[placeId]) {
      $scope.places[placeId] = address;
    }
  }
  
  function readNews(fixedNews) {
    $q.all(fbPosts.fetched).then(function(results) {
      angular.forEach(fbPosts.check, function(post, index) {
        var fbPosts = results[index];
        if (fbPosts.length > 0) {
          post.time = new Date(fbPosts[0].created_time);
          post.messages = fbPosts;
          $scope.posts.push(post);
        }
      });
      angular.forEach(fixedNews, function(news) {
        news.time = new Date(news.time);
        $scope.posts.push(news);
      });
      $scope.postsLoading = false;
    });
  } 
  
  function addFbPost(place) {
    if (place.fb) {
      fbPosts.check.push({by: place.name, fbHref: 'https://www.facebook.com/' + place.fb, placeId: place.id});
      fbPosts.fetched.push(fb.fetchLastPosts(place.fb, config.fbToken));
    }
  }
  
  function createMapMarkers(places) {
    return script.infoBox().then(function() {
      geocoder = new google.maps.Geocoder();
      angular.forEach(places, function(place) {
        if (place !== null && place.id) {
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
          addFbPost(place);
        }
      });
    });
  }
  
  function createMapLegend() {
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
      $location.hash(hash);
      $anchorScroll();
      $location.hash(old);  //reset to old to keep any additional routing logic from kicking in
    }, 50);
  };
  
  $scope.reload = function() {
    $timeout(function() { $window.location.reload(); }, 0);
  };
}]);